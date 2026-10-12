"""
admin/routes.py

Every route here is protected by @admin_required. Content management
writes directly to content/ via content_manager.py — there is no
"lessons" database table; the filesystem is still the single source of
truth for educational content, exactly as the original architecture
established.
"""

from datetime import datetime, timedelta, timezone
from pathlib import Path

import markdown
from flask import Blueprint, abort, current_app, flash, jsonify, redirect, render_template, request, url_for
from flask_login import current_user
from werkzeug.utils import secure_filename

from app.admin import content_manager
from app.admin.content_manager import ContentValidationError
from app.admin.decorators import admin_required
from app.admin.forms import LessonForm, LessonNoteForm, MediaUploadForm, SectionForm, SubjectForm, UserEditForm
from app.extensions import db
from app.models.bookmark import Bookmark
from app.models.lesson_note import LessonNote
from app.models.note import Note
from app.models.progress import Progress
from app.models.user import VALID_ROLES, User
from app.services.content_loader import _rewrite_media_urls, list_subjects
from app.uploads.storage import save_uploaded_file

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

MEDIA_SUBFOLDER_BY_EXT = {
    "png": "images", "jpg": "images", "jpeg": "images", "gif": "images", "svg": "images",
    "mp4": "videos", "webm": "videos",
    "pdf": "files", "zip": "files",
}


@admin_bp.route("/")
@admin_required
def dashboard():
    total_users = User.query.count()
    total_students = User.query.filter_by(role="student").count()
    total_admins = User.query.filter_by(role="admin").count()
    total_completions = Progress.query.count()
    total_bookmarks = Bookmark.query.count()
    total_notes = Note.query.count()
    total_subjects = len(list_subjects())

    # Most-bookmarked lessons — simple, dependency-free aggregation
    # rather than a raw SQL GROUP BY, since the row count here is small
    # enough that doing it in Python stays clear and easy to follow.
    counts = {}
    for bookmark in Bookmark.query.all():
        counts[bookmark.lesson_path] = counts.get(bookmark.lesson_path, 0) + 1
    top_bookmarked = sorted(counts.items(), key=lambda item: item[1], reverse=True)[:5]

    return render_template(
        "admin/dashboard.html",
        total_users=total_users,
        total_students=total_students,
        total_admins=total_admins,
        total_completions=total_completions,
        total_bookmarks=total_bookmarks,
        total_notes=total_notes,
        total_subjects=total_subjects,
        top_bookmarked=top_bookmarked,
    )


# ---------- User management ----------

@admin_bp.route("/users")
@admin_required
def users():
    query = User.query
    search_q = request.args.get("q", "").strip()
    role_filter = request.args.get("role", "").strip()
    status_filter = request.args.get("status", "").strip()

    if search_q:
        query = query.filter(
            (User.name.ilike(f"%{search_q}%")) | (User.email.ilike(f"%{search_q}%"))
        )
    if role_filter in ("student", "admin"):
        query = query.filter_by(role=role_filter)
    if status_filter == "active":
        query = query.filter_by(is_active=True)
    elif status_filter == "inactive":
        query = query.filter_by(is_active=False)

    all_users = query.order_by(User.created_at.desc()).all()
    return render_template(
        "admin/users.html",
        users=all_users,
        search_q=search_q,
        role_filter=role_filter,
        status_filter=status_filter,
    )


@admin_bp.route("/users/<int:user_id>/edit", methods=["GET", "POST"])
@admin_required
def edit_user(user_id):
    user = User.query.get_or_404(user_id)
    form = UserEditForm(obj=user)

    if form.validate_on_submit():
        existing_email = User.query.filter(User.email == form.email.data.strip().lower(), User.id != user.id).first()
        if existing_email:
            flash("That email address is already in use by another user.", "error")
        else:
            if user.id == current_user.id and form.role.data != "admin":
                flash("You cannot demote yourself from admin.", "error")
            elif user.id == current_user.id and not form.is_active.data:
                flash("You cannot deactivate your own account.", "error")
            else:
                user.name = form.name.data.strip()
                user.email = form.email.data.strip().lower()
                user.role = form.role.data
                user.is_active = form.is_active.data
                db.session.commit()
                flash(f"User {user.name} updated successfully.", "success")
                return redirect(url_for("admin.users"))

    return render_template("admin/user_edit.html", form=form, user=user)


@admin_bp.route("/users/<int:user_id>/progress")
@admin_required
def user_progress(user_id):
    user = User.query.get_or_404(user_id)
    completions = Progress.query.filter_by(user_id=user.id).order_by(Progress.completed_at.desc()).all()
    bookmarks = Bookmark.query.filter_by(user_id=user.id).order_by(Bookmark.created_at.desc()).all()
    notes = Note.query.filter_by(user_id=user.id).order_by(Note.updated_at.desc()).all()
    return render_template(
        "admin/user_progress.html",
        user=user,
        completions=completions,
        bookmarks=bookmarks,
        notes=notes,
    )


@admin_bp.route("/users/<int:user_id>/role", methods=["POST"])
@admin_required
def change_role(user_id):
    user = User.query.get_or_404(user_id)
    new_role = request.form.get("role")

    if new_role not in VALID_ROLES:
        abort(400)

    if user.id == current_user.id and new_role != "admin":
        flash("You can't remove your own admin access.", "error")
        return redirect(url_for("admin.users"))

    user.role = new_role
    db.session.commit()
    flash(f"{user.name}'s role updated to {new_role}.", "success")
    return redirect(url_for("admin.users"))


@admin_bp.route("/users/<int:user_id>/delete", methods=["POST"])
@admin_required
def delete_user(user_id):
    if user_id == current_user.id:
        flash("You can't delete your own account.", "error")
        return redirect(url_for("admin.users"))

    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    flash(f"{user.name}'s account was deleted.", "info")
    return redirect(url_for("admin.users"))


@admin_bp.route("/users/<int:user_id>/toggle-active", methods=["POST"])
@admin_required
def toggle_active(user_id):
    """Activate or deactivate a user account. Deactivated users cannot log in."""
    if user_id == current_user.id:
        flash("You can't deactivate your own account.", "error")
        return redirect(url_for("admin.users"))

    user = User.query.get_or_404(user_id)
    user.is_active = not user.is_active
    db.session.commit()
    action = "activated" if user.is_active else "deactivated"
    flash(f"{user.name}'s account has been {action}.", "success")
    return redirect(url_for("admin.users"))


# ---------- Content management: subjects ----------

@admin_bp.route("/content")
@admin_required
def content_home():
    subject_slugs = content_manager.list_all_subjects()
    return render_template("admin/content_subjects.html", subject_slugs=subject_slugs)


@admin_bp.route("/content/subjects/new", methods=["GET", "POST"])
@admin_required
def new_subject():
    form = SubjectForm()
    if form.validate_on_submit():
        try:
            content_manager.create_subject(form.slug.data, form.title.data)
            flash("Subject created.", "success")
            return redirect(url_for("admin.content_home"))
        except ContentValidationError as e:
            flash(str(e), "error")

    return render_template("admin/subject_form.html", form=form)


@admin_bp.route("/content/<subject_slug>/delete", methods=["POST"])
@admin_required
def delete_subject(subject_slug):
    try:
        content_manager.delete_subject(subject_slug)
        flash("Subject and all its content deleted.", "info")
    except ContentValidationError as e:
        flash(str(e), "error")
    return redirect(url_for("admin.content_home"))


# ---------- Content management: sections ----------

@admin_bp.route("/content/<subject_slug>")
@admin_required
def view_subject_content(subject_slug):
    subject_dir = Path(current_app.config["CONTENT_DIR"]) / subject_slug
    if not subject_dir.is_dir():
        abort(404)
    sections = content_manager.list_all_sections(subject_slug)
    return render_template("admin/content_sections.html", subject_slug=subject_slug, sections=sections)


@admin_bp.route("/content/<subject_slug>/sections/new", methods=["GET", "POST"])
@admin_required
def new_section(subject_slug):
    form = SectionForm()
    if form.validate_on_submit():
        try:
            content_manager.create_section(subject_slug, form.title.data)
            flash("Section created.", "success")
            return redirect(url_for("admin.view_subject_content", subject_slug=subject_slug))
        except ContentValidationError as e:
            flash(str(e), "error")

    return render_template("admin/section_form.html", form=form, subject_slug=subject_slug)


@admin_bp.route("/content/<subject_slug>/<section_folder>/delete", methods=["POST"])
@admin_required
def delete_section(subject_slug, section_folder):
    try:
        content_manager.delete_section(subject_slug, section_folder)
        flash("Section and all its lessons deleted.", "info")
    except ContentValidationError as e:
        flash(str(e), "error")
    return redirect(url_for("admin.view_subject_content", subject_slug=subject_slug))


# ---------- Content management: lessons ----------

@admin_bp.route("/content/<subject_slug>/<section_folder>")
@admin_required
def view_section_content(subject_slug, section_folder):
    lessons = content_manager.list_all_lessons(subject_slug, section_folder)
    return render_template(
        "admin/content_lessons.html",
        subject_slug=subject_slug,
        section_folder=section_folder,
        lessons=lessons,
    )


@admin_bp.route("/content/<subject_slug>/<section_folder>/lessons/new", methods=["GET", "POST"])
@admin_required
def new_lesson(subject_slug, section_folder):
    form = LessonForm()
    if form.validate_on_submit():
        try:
            filename = content_manager.create_lesson(subject_slug, section_folder, form.title.data, form.body.data)
            _handle_media_upload(form, subject_slug, section_folder)

            # create_lesson() always writes a lesson as published. If the
            # admin clicked "Save Draft" instead of "Publish", immediately
            # move it into .drafts using the *existing* toggle_publish()
            # function — reusing that logic rather than teaching
            # create_lesson a second code path for the same outcome.
            if request.form.get("action") == "draft":
                content_manager.toggle_publish(subject_slug, section_folder, filename)
                flash("Lesson saved as draft.", "success")
            else:
                flash("Lesson published.", "success")

            return redirect(url_for("admin.view_section_content", subject_slug=subject_slug, section_folder=section_folder))
        except ContentValidationError as e:
            flash(str(e), "error")

    return render_template(
        "admin/lesson_form.html", form=form, subject_slug=subject_slug, section_folder=section_folder, filename=None
    )


@admin_bp.route("/content/<subject_slug>/<section_folder>/<filename>/edit", methods=["GET", "POST"])
@admin_required
def edit_lesson(subject_slug, section_folder, filename):
    try:
        existing = content_manager.read_lesson_raw(subject_slug, section_folder, filename)
    except ContentValidationError:
        abort(404)

    form = LessonForm(title=existing["title"], body=existing["body"])

    if form.validate_on_submit():
        try:
            content_manager.edit_lesson(subject_slug, section_folder, filename, form.title.data, form.body.data)
            _handle_media_upload(form, subject_slug, section_folder)

            wants_draft = request.form.get("action") == "draft"
            currently_published = content_manager.is_lesson_published(subject_slug, section_folder, filename)
            if wants_draft == currently_published:
                # Current state doesn't match what was requested — flip it.
                # (wants_draft and currently_published both True means "on,
                # but should be off"; both False means "off, but should be on".)
                content_manager.toggle_publish(subject_slug, section_folder, filename)

            flash("Lesson saved as draft." if wants_draft else "Lesson published.", "success")
            return redirect(url_for("admin.view_section_content", subject_slug=subject_slug, section_folder=section_folder))
        except ContentValidationError as e:
            flash(str(e), "error")

    return render_template(
        "admin/lesson_form.html", form=form, subject_slug=subject_slug, section_folder=section_folder, filename=filename
    )


@admin_bp.route("/content/<subject_slug>/<section_folder>/<filename>/delete", methods=["POST"])
@admin_required
def delete_lesson(subject_slug, section_folder, filename):
    try:
        content_manager.delete_lesson(subject_slug, section_folder, filename)
        flash("Lesson deleted.", "info")
    except ContentValidationError as e:
        flash(str(e), "error")
    return redirect(url_for("admin.view_section_content", subject_slug=subject_slug, section_folder=section_folder))


@admin_bp.route("/content/<subject_slug>/<section_folder>/<filename>/publish", methods=["POST"])
@admin_required
def toggle_publish(subject_slug, section_folder, filename):
    try:
        now_published = content_manager.toggle_publish(subject_slug, section_folder, filename)
        flash("Lesson published." if now_published else "Lesson unpublished (moved to drafts).", "success")
    except ContentValidationError as e:
        flash(str(e), "error")
    return redirect(url_for("admin.view_section_content", subject_slug=subject_slug, section_folder=section_folder))


@admin_bp.route("/content/<subject_slug>/<section_folder>/<filename>/duplicate", methods=["POST"])
@admin_required
def duplicate_lesson(subject_slug, section_folder, filename):
    try:
        existing = content_manager.read_lesson_raw(subject_slug, section_folder, filename)
        new_title = f"{existing['title']} (Copy)"
        new_filename = content_manager.create_lesson(
            subject_slug, section_folder, new_title, existing["body"]
        )
        if not content_manager.is_lesson_published(subject_slug, section_folder, filename):
            content_manager.toggle_publish(subject_slug, section_folder, new_filename)
        flash(f"Lesson duplicated as '{new_title}'.", "success")
    except ContentValidationError as e:
        flash(str(e), "error")
    return redirect(url_for("admin.view_section_content", subject_slug=subject_slug, section_folder=section_folder))


@admin_bp.route("/content/<subject_slug>/<section_folder>/<filename>/preview")
@admin_required
def preview_lesson(subject_slug, section_folder, filename):
    try:
        lesson = content_manager.read_lesson_raw(subject_slug, section_folder, filename)
    except ContentValidationError:
        abort(404)

    is_published = content_manager.is_lesson_published(subject_slug, section_folder, filename)
    body_html = markdown.markdown(lesson["body"], extensions=["fenced_code", "tables"])
    body_html = _rewrite_media_urls(body_html, subject_slug, section_folder)

    return render_template(
        "admin/lesson_preview.html",
        subject_slug=subject_slug,
        section_folder=section_folder,
        filename=filename,
        title=lesson["title"],
        body_html=body_html,
        is_published=is_published,
    )


# ---------- Media Library ----------

@admin_bp.route("/content/<subject_slug>/<section_folder>/media", methods=["GET", "POST"])
@admin_required
def section_media(subject_slug, section_folder):
    section_dir = Path(current_app.config["CONTENT_DIR"]) / subject_slug / section_folder
    if not section_dir.is_dir():
        abort(404)

    form = MediaUploadForm()
    if form.validate_on_submit():
        file_storage = form.media_file.data
        if file_storage and file_storage.filename:
            fname = secure_filename(file_storage.filename)
            ext = fname.rsplit(".", 1)[-1].lower() if "." in fname else ""
            subfolder = MEDIA_SUBFOLDER_BY_EXT.get(ext, "files")
            target_dir = section_dir / subfolder
            target_dir.mkdir(parents=True, exist_ok=True)
            file_storage.save(target_dir / fname)
            flash(f"Uploaded {fname} to {subfolder}/.", "success")
            return redirect(url_for("admin.section_media", subject_slug=subject_slug, section_folder=section_folder))

    media_items = []
    for sub in ["images", "files", "videos"]:
        sdir = section_dir / sub
        if sdir.is_dir():
            for f in sorted(sdir.iterdir()):
                if f.is_file():
                    ext = f.suffix.lstrip(".").lower()
                    is_img = ext in ["png", "jpg", "jpeg", "gif", "svg", "webp"]
                    is_vid = ext in ["mp4", "webm"]
                    snippet = f"![{f.stem}]({sub}/{f.name})" if is_img else f"[{f.name}]({sub}/{f.name})"
                    media_items.append({
                        "filename": f.name,
                        "subfolder": sub,
                        "size_bytes": f.stat().st_size,
                        "is_image": is_img,
                        "is_video": is_vid,
                        "snippet": snippet,
                        "url": url_for("main.content_media", subject_slug=subject_slug, section_folder=section_folder, filepath=f"{sub}/{f.name}")
                    })

    return render_template(
        "admin/media_library.html",
        subject_slug=subject_slug,
        section_folder=section_folder,
        form=form,
        media_items=media_items,
    )


@admin_bp.route("/content/<subject_slug>/<section_folder>/media/<subfolder>/<filename>/delete", methods=["POST"])
@admin_required
def delete_section_media(subject_slug, section_folder, subfolder, filename):
    if subfolder not in ("images", "files", "videos"):
        abort(400)
    safe_filename = secure_filename(filename)
    target_file = Path(current_app.config["CONTENT_DIR"]) / subject_slug / section_folder / subfolder / safe_filename
    if target_file.is_file():
        target_file.unlink()
        flash(f"Deleted {safe_filename}.", "info")
    else:
        flash("File not found.", "error")
    return redirect(url_for("admin.section_media", subject_slug=subject_slug, section_folder=section_folder))


def _handle_media_upload(form, subject_slug, section_folder):
    """
    Saves an uploaded image/file/video alongside the lesson's Markdown,
    following the exact images/ · files/ · videos/ folder convention
    already documented in CONTENT_GUIDE.md — so lessons authored via the
    admin panel and lessons authored by hand end up in the same shape.
    """
    file_storage = form.media.data
    if not file_storage or not file_storage.filename:
        return

    filename = secure_filename(file_storage.filename)
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    subfolder = MEDIA_SUBFOLDER_BY_EXT.get(ext, "files")

    target_dir = Path(current_app.config["CONTENT_DIR"]) / subject_slug / section_folder / subfolder
    target_dir.mkdir(parents=True, exist_ok=True)
    file_storage.save(target_dir / filename)

    flash(
        f"Uploaded — reference it in your Markdown as: ![description]({subfolder}/{filename}) "
        f"or [download link]({subfolder}/{filename})",
        "info",
    )


# ---------- User-generated notes (moderation) ----------

@admin_bp.route("/notes")
@admin_required
def all_notes():
    notes = Note.query.order_by(Note.created_at.desc()).all()
    return render_template("admin/notes.html", notes=notes)


@admin_bp.route("/notes/<int:note_id>/delete", methods=["POST"])
@admin_required
def delete_note(note_id):
    note = Note.query.get_or_404(note_id)
    db.session.delete(note)
    db.session.commit()
    flash("Note removed.", "info")
    return redirect(url_for("admin.all_notes"))


# ---------- Drag-and-drop reordering ----------
# Each GET renders a sortable list (see reorder.js); each POST receives
# the full new sequence as a JSON array of slugs/filenames and hands it
# straight to the matching content_manager.reorder_*() function, which
# renumbers order=0..N-1 to match. The list shown is always built from
# the same order-aware functions the public site and rest of the admin
# panel already use, so what the admin sees here is exactly today's
# real order — never stale.

@admin_bp.route("/content/reorder/subjects", methods=["GET", "POST"])
@admin_required
def reorder_subjects_view():
    if request.method == "POST":
        ordered_slugs = request.get_json(silent=True) or []
        content_manager.reorder_subjects(ordered_slugs)
        return jsonify({"status": "ok"})

    subjects = [{"slug": s["slug"], "title": s["title"]} for s in list_subjects()]
    return render_template("admin/reorder.html",
                           heading="Reorder Subjects",
                           items=subjects,
                           save_url=url_for("admin.reorder_subjects_view"),
                           back_url=url_for("admin.content_home"))


@admin_bp.route("/content/<subject_slug>/reorder/sections", methods=["GET", "POST"])
@admin_required
def reorder_sections_view(subject_slug):
    if request.method == "POST":
        ordered_folders = request.get_json(silent=True) or []
        content_manager.reorder_sections(subject_slug, ordered_folders)
        return jsonify({"status": "ok"})

    section_folders = content_manager.list_all_sections(subject_slug)
    items = [{"slug": folder, "title": folder} for folder in section_folders]
    return render_template("admin/reorder.html",
                           heading=f"Reorder Sections — {subject_slug}",
                           items=items,
                           save_url=url_for("admin.reorder_sections_view", subject_slug=subject_slug),
                           back_url=url_for("admin.view_subject_content", subject_slug=subject_slug))


@admin_bp.route("/content/<subject_slug>/<section_folder>/reorder/lessons", methods=["GET", "POST"])
@admin_required
def reorder_lessons_view(subject_slug, section_folder):
    if request.method == "POST":
        ordered_filenames = request.get_json(silent=True) or []
        content_manager.reorder_lessons(subject_slug, section_folder, ordered_filenames)
        return jsonify({"status": "ok"})

    lessons = content_manager.list_all_lessons(subject_slug, section_folder)
    items = [{"slug": lesson["filename"], "title": lesson["title"]} for lesson in lessons]
    return render_template("admin/reorder.html",
                           heading=f"Reorder Lessons — {subject_slug}/{section_folder}",
                           items=items,
                           save_url=url_for("admin.reorder_lessons_view", subject_slug=subject_slug, section_folder=section_folder),
                           back_url=url_for("admin.view_section_content", subject_slug=subject_slug, section_folder=section_folder))


# ---------- Official lesson notes (public, admin-authored) ----------
# Deliberately separate from the student-notes routes above: these
# operate on the LessonNote model (its own table), never on Note.

@admin_bp.route("/content/<subject_slug>/<lesson_slug>/notes")
@admin_required
def lesson_notes(subject_slug, lesson_slug):
    lesson_path = f"{subject_slug}/{lesson_slug}"
    notes = (
        LessonNote.query.filter_by(lesson_path=lesson_path)
        .order_by(LessonNote.pinned.desc(), LessonNote.sort_order, LessonNote.created_at)
        .all()
    )
    return render_template(
        "admin/lesson_notes.html", subject_slug=subject_slug, lesson_slug=lesson_slug, notes=notes
    )


@admin_bp.route("/content/<subject_slug>/<lesson_slug>/notes/new", methods=["GET", "POST"])
@admin_required
def new_lesson_note(subject_slug, lesson_slug):
    form = LessonNoteForm()
    if form.validate_on_submit():
        lesson_path = f"{subject_slug}/{lesson_slug}"
        attachment_path = save_uploaded_file(form.attachment.data, subfolder="lesson_notes")
        note = LessonNote(
            lesson_path=lesson_path,
            title=form.title.data.strip(),
            body=form.body.data,
            attachment_path=attachment_path,
            published=form.published.data,
            pinned=form.pinned.data,
            author_id=current_user.id,
        )
        db.session.add(note)
        db.session.commit()
        flash("Lesson note created.", "success")
        return redirect(url_for("admin.lesson_notes", subject_slug=subject_slug, lesson_slug=lesson_slug))

    return render_template(
        "admin/lesson_note_form.html", form=form, subject_slug=subject_slug, lesson_slug=lesson_slug, note=None
    )


@admin_bp.route("/content/<subject_slug>/<lesson_slug>/notes/<int:note_id>/edit", methods=["GET", "POST"])
@admin_required
def edit_lesson_note(subject_slug, lesson_slug, note_id):
    note = LessonNote.query.get_or_404(note_id)
    form = LessonNoteForm(obj=note)

    if form.validate_on_submit():
        note.title = form.title.data.strip()
        note.body = form.body.data
        note.published = form.published.data
        note.pinned = form.pinned.data
        new_attachment = save_uploaded_file(form.attachment.data, subfolder="lesson_notes")
        if new_attachment:
            note.attachment_path = new_attachment
        db.session.commit()
        flash("Lesson note updated.", "success")
        return redirect(url_for("admin.lesson_notes", subject_slug=subject_slug, lesson_slug=lesson_slug))

    return render_template(
        "admin/lesson_note_form.html", form=form, subject_slug=subject_slug, lesson_slug=lesson_slug, note=note
    )


@admin_bp.route("/content/<subject_slug>/<lesson_slug>/notes/<int:note_id>/delete", methods=["POST"])
@admin_required
def delete_lesson_note(subject_slug, lesson_slug, note_id):
    note = LessonNote.query.get_or_404(note_id)
    db.session.delete(note)
    db.session.commit()
    flash("Lesson note deleted.", "info")
    return redirect(url_for("admin.lesson_notes", subject_slug=subject_slug, lesson_slug=lesson_slug))


@admin_bp.route("/content/<subject_slug>/<lesson_slug>/notes/<int:note_id>/publish", methods=["POST"])
@admin_required
def toggle_lesson_note_publish(subject_slug, lesson_slug, note_id):
    note = LessonNote.query.get_or_404(note_id)
    note.published = not note.published
    db.session.commit()
    flash("Note published." if note.published else "Note unpublished.", "success")
    return redirect(url_for("admin.lesson_notes", subject_slug=subject_slug, lesson_slug=lesson_slug))


@admin_bp.route("/content/<subject_slug>/<lesson_slug>/notes/<int:note_id>/pin", methods=["POST"])
@admin_required
def toggle_lesson_note_pin(subject_slug, lesson_slug, note_id):
    note = LessonNote.query.get_or_404(note_id)
    note.pinned = not note.pinned
    db.session.commit()
    flash("Note pinned." if note.pinned else "Note unpinned.", "success")
    return redirect(url_for("admin.lesson_notes", subject_slug=subject_slug, lesson_slug=lesson_slug))


# ---------- Analytics ----------

@admin_bp.route("/analytics")
@admin_required
def analytics():
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    recent_progress = Progress.query.filter(Progress.completed_at >= thirty_days_ago).all()

    daily_completions = {}
    for i in range(30):
        day_date = (now - timedelta(days=29 - i)).strftime("%Y-%m-%d")
        daily_completions[day_date] = 0
    for p in recent_progress:
        day_str = p.completed_at.strftime("%Y-%m-%d")
        if day_str in daily_completions:
            daily_completions[day_str] += 1

    daily_stats = sorted(daily_completions.items())

    lesson_counts = {}
    for p in Progress.query.all():
        lesson_counts[p.lesson_path] = lesson_counts.get(p.lesson_path, 0) + 1
    top_completed = sorted(lesson_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    seven_days_ago = now - timedelta(days=7)
    active_user_ids = set()
    for p in Progress.query.filter(Progress.completed_at >= seven_days_ago).all():
        active_user_ids.add(p.user_id)
    for b in Bookmark.query.filter(Bookmark.created_at >= seven_days_ago).all():
        active_user_ids.add(b.user_id)
    for n in Note.query.filter(Note.updated_at >= seven_days_ago).all():
        active_user_ids.add(n.user_id)

    active_users = User.query.filter(User.id.in_(active_user_ids)).all() if active_user_ids else []

    return render_template(
        "admin/analytics.html",
        daily_stats=daily_stats,
        top_completed=top_completed,
        active_users=active_users,
        active_users_count=len(active_users),
    )


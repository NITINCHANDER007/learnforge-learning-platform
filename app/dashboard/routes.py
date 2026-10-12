"""
dashboard/routes.py

The student-facing dashboard. Every route here requires login
(@login_required) but not admin — any authenticated user, student or
admin, can use their own dashboard.

Bookmarks and progress are looked up by resolving each stored
lesson_path back through content_loader.load_lesson() — reusing the
existing content system rather than caching lesson titles in the
database, which would risk drifting out of sync with the actual
Markdown files if a lesson is ever renamed or removed.
"""

from datetime import datetime, timedelta, timezone

from flask import Blueprint, Response, abort, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required

from app.dashboard.forms import ChangePasswordForm, NoteForm, ProfileForm
from app.extensions import db
from app.models.bookmark import Bookmark
from app.models.note import Note
from app.models.progress import Progress
from app.services.content_loader import (
    LessonNotFoundError,
    build_subject_tree,
    list_subjects,
    load_lesson,
)
from app.services.nav_engine import get_lesson_nav
from app.uploads.storage import save_uploaded_file

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


def _resolve_lesson_paths(lesson_paths):
    """
    Turn a list of "subject/lesson" strings into display-ready dicts
    with a title, gracefully skipping any that no longer exist (a
    lesson can be renamed or deleted from content/ independently of
    the database — the dashboard should degrade gracefully, not crash).
    """
    resolved = []
    for path in lesson_paths:
        subject_slug, _, lesson_slug = path.partition("/")
        try:
            lesson = load_lesson(subject_slug, lesson_slug)
        except LessonNotFoundError:
            continue
        resolved.append({
            "path": path,
            "subject_slug": subject_slug,
            "lesson_slug": lesson_slug,
            "title": lesson["title"],
        })
    return resolved


def _calculate_streak(user_id):
    """
    Consecutive-day learning streak, counting backward from today. A
    "day" counts if it has at least one completed lesson. This is a
    read-only aggregation over data Progress already stores — it adds
    no new model, table, or column.
    """
    completed_dates = {
        p.completed_at.date() for p in Progress.query.filter_by(user_id=user_id).all()
    }
    if not completed_dates:
        return 0

    streak = 0
    day = datetime.now(timezone.utc).date()
    while day in completed_dates:
        streak += 1
        day -= timedelta(days=1)
    return streak


def _subject_progress_chart(user_id):
    """
    Completed-vs-total lesson counts per subject the student has
    started. Reuses list_subjects()/build_subject_tree() — the exact
    same content-tree functions the public site renders from — rather
    than re-deriving lesson counts independently.
    """
    completed_paths = {p.lesson_path for p in Progress.query.filter_by(user_id=user_id).all()}

    chart = []
    for subject in list_subjects():
        tree = build_subject_tree(subject["slug"])
        lesson_paths = [
            f"{subject['slug']}/{lesson['slug']}"
            for section in tree["sections"]
            for lesson in section["lessons"]
        ]
        if not lesson_paths:
            continue

        completed_in_subject = sum(1 for path in lesson_paths if path in completed_paths)
        if completed_in_subject == 0:
            continue  # only show subjects the student has actually started

        chart.append({
            "title": subject["title"],
            "slug": subject["slug"],
            "completed": completed_in_subject,
            "total": len(lesson_paths),
            "percent": round(completed_in_subject / len(lesson_paths) * 100),
        })
    return chart


def _get_continue_learning(user_id):
    """
    Suggests the lesson immediately after the student's most recently
    completed one, via the existing nav engine (get_lesson_nav) —
    reusing lesson ordering rather than re-deriving it.
    """
    last_progress = (
        Progress.query.filter_by(user_id=user_id)
        .order_by(Progress.completed_at.desc())
        .first()
    )
    if not last_progress:
        return None

    subject_slug, _, lesson_slug = last_progress.lesson_path.partition("/")
    tree = build_subject_tree(subject_slug)
    if not tree:
        return None

    nav = get_lesson_nav(tree, lesson_slug)
    if not nav or not nav["next"]:
        return None

    return {
        "subject_slug": subject_slug,
        "lesson_slug": nav["next"]["slug"],
        "title": nav["next"]["title"],
        "subject_title": tree["title"],
    }


def _get_recent_activity(user_id, limit=6):
    """
    A merged, time-sorted feed of the student's recent progress,
    bookmark, and note events. Lesson titles are only resolved for
    the final trimmed list, not for every row fetched.
    """
    events = []
    for p in Progress.query.filter_by(user_id=user_id).order_by(Progress.completed_at.desc()).limit(limit).all():
        events.append({"type": "completed", "at": p.completed_at, "lesson_path": p.lesson_path})
    for b in Bookmark.query.filter_by(user_id=user_id).order_by(Bookmark.created_at.desc()).limit(limit).all():
        events.append({"type": "bookmarked", "at": b.created_at, "lesson_path": b.lesson_path})
    for n in Note.query.filter_by(user_id=user_id).order_by(Note.created_at.desc()).limit(limit).all():
        events.append({"type": "note", "at": n.created_at, "title": n.title})

    events.sort(key=lambda e: e["at"], reverse=True)
    events = events[:limit]

    for event in events:
        if "lesson_path" in event:
            subject_slug, _, lesson_slug = event["lesson_path"].partition("/")
            try:
                lesson = load_lesson(subject_slug, lesson_slug)
                event["title"] = lesson["title"]
                event["subject_slug"] = subject_slug
                event["lesson_slug"] = lesson_slug
            except LessonNotFoundError:
                event["title"] = event["lesson_path"]
                event["subject_slug"] = None
                event["lesson_slug"] = None

    return events


@dashboard_bp.route("/")
@login_required
def home():
    completed_count = Progress.query.filter_by(user_id=current_user.id).count()
    bookmark_count = Bookmark.query.filter_by(user_id=current_user.id).count()
    note_count = Note.query.filter_by(user_id=current_user.id).count()

    recent_bookmarks = (
        Bookmark.query.filter_by(user_id=current_user.id)
        .order_by(Bookmark.created_at.desc())
        .limit(5)
        .all()
    )
    recent_bookmarks = _resolve_lesson_paths([b.lesson_path for b in recent_bookmarks])

    return render_template(
        "dashboard/home.html",
        completed_count=completed_count,
        bookmark_count=bookmark_count,
        note_count=note_count,
        recent_bookmarks=recent_bookmarks,
        streak=_calculate_streak(current_user.id),
        progress_chart=_subject_progress_chart(current_user.id),
        continue_learning=_get_continue_learning(current_user.id),
        recent_activity=_get_recent_activity(current_user.id),
    )


@dashboard_bp.route("/profile", methods=["GET", "POST"])
@login_required
def profile():
    form = ProfileForm(current_user_id=current_user.id, obj=current_user)

    if form.validate_on_submit():
        current_user.name = form.name.data.strip()
        current_user.email = form.email.data.lower().strip()
        db.session.commit()
        flash("Profile updated.", "success")
        return redirect(url_for("dashboard.profile"))

    return render_template("dashboard/profile.html", form=form)


@dashboard_bp.route("/password", methods=["GET", "POST"])
@login_required
def change_password():
    form = ChangePasswordForm()

    if form.validate_on_submit():
        if not current_user.check_password(form.current_password.data):
            flash("Current password is incorrect.", "error")
        else:
            current_user.set_password(form.new_password.data)
            db.session.commit()
            flash("Password changed successfully.", "success")
            return redirect(url_for("dashboard.profile"))

    return render_template("dashboard/change_password.html", form=form)


@dashboard_bp.route("/bookmarks")
@login_required
def bookmarks():
    all_bookmarks = (
        Bookmark.query.filter_by(user_id=current_user.id)
        .order_by(Bookmark.created_at.desc())
        .all()
    )
    resolved = _resolve_lesson_paths([b.lesson_path for b in all_bookmarks])
    return render_template("dashboard/bookmarks.html", bookmarks=resolved)


@dashboard_bp.route("/bookmarks/toggle", methods=["POST"])
@login_required
def toggle_bookmark():
    """
    Called from the small bookmark button on a lesson page (see
    lesson.html). Redirects back to that same lesson afterward.
    """
    subject_slug = request.form.get("subject_slug")
    lesson_slug = request.form.get("lesson_slug")
    if not subject_slug or not lesson_slug:
        abort(400)

    lesson_path = f"{subject_slug}/{lesson_slug}"
    existing = Bookmark.query.filter_by(user_id=current_user.id, lesson_path=lesson_path).first()

    if existing:
        db.session.delete(existing)
        flash("Bookmark removed.", "info")
    else:
        db.session.add(Bookmark(user_id=current_user.id, lesson_path=lesson_path))
        flash("Lesson bookmarked.", "success")

    db.session.commit()
    return redirect(url_for("main.view_lesson", subject_slug=subject_slug, lesson_slug=lesson_slug))


@dashboard_bp.route("/progress/toggle", methods=["POST"])
@login_required
def toggle_progress():
    """Same pattern as toggle_bookmark, for the "mark complete" control."""
    subject_slug = request.form.get("subject_slug")
    lesson_slug = request.form.get("lesson_slug")
    if not subject_slug or not lesson_slug:
        abort(400)

    lesson_path = f"{subject_slug}/{lesson_slug}"
    existing = Progress.query.filter_by(user_id=current_user.id, lesson_path=lesson_path).first()

    if existing:
        db.session.delete(existing)
        flash("Marked as not completed.", "info")
    else:
        db.session.add(Progress(user_id=current_user.id, lesson_path=lesson_path))
        flash("Marked as completed!", "success")

    db.session.commit()
    return redirect(url_for("main.view_lesson", subject_slug=subject_slug, lesson_slug=lesson_slug))


@dashboard_bp.route("/notes")
@login_required
def notes():
    all_notes = (
        Note.query.filter_by(user_id=current_user.id).order_by(Note.updated_at.desc()).all()
    )
    return render_template("dashboard/notes.html", notes=all_notes)


@dashboard_bp.route("/notes/new", methods=["GET", "POST"])
@login_required
def new_note():
    form = NoteForm()

    if form.validate_on_submit():
        attachment_path = save_uploaded_file(form.attachment.data, subfolder=f"notes/{current_user.id}")
        note = Note(
            user_id=current_user.id,
            title=form.title.data.strip(),
            body=form.body.data,
            attachment_path=attachment_path,
        )
        db.session.add(note)
        db.session.commit()
        flash("Note saved.", "success")
        return redirect(url_for("dashboard.notes"))

    return render_template("dashboard/note_form.html", form=form, note=None)


@dashboard_bp.route("/notes/<int:note_id>/edit", methods=["GET", "POST"])
@login_required
def edit_note(note_id):
    note = Note.query.get_or_404(note_id)
    if note.user_id != current_user.id:
        abort(403)

    form = NoteForm(obj=note)

    if form.validate_on_submit():
        note.title = form.title.data.strip()
        note.body = form.body.data
        new_attachment = save_uploaded_file(form.attachment.data, subfolder=f"notes/{current_user.id}")
        if new_attachment:
            note.attachment_path = new_attachment
        db.session.commit()
        flash("Note updated.", "success")
        return redirect(url_for("dashboard.notes"))

    return render_template("dashboard/note_form.html", form=form, note=note)


@dashboard_bp.route("/notes/<int:note_id>/delete", methods=["POST"])
@login_required
def delete_note(note_id):
    note = Note.query.get_or_404(note_id)
    if note.user_id != current_user.id:
        abort(403)

    db.session.delete(note)
    db.session.commit()
    flash("Note deleted.", "info")
    return redirect(url_for("dashboard.notes"))


@dashboard_bp.route("/export-data")
@login_required
def export_data():
    """Download an archival JSON backup of the student's progress, bookmarks, and notes."""
    import json
    notes = Note.query.filter_by(user_id=current_user.id).all()
    bookmarks = Bookmark.query.filter_by(user_id=current_user.id).all()
    progress = Progress.query.filter_by(user_id=current_user.id).all()

    payload = {
        "version": "1.0",
        "platform": "DataDrix",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "user": {
            "name": current_user.name,
            "email": current_user.email,
        },
        "notes": [
            {
                "title": n.title,
                "body": n.body,
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "updated_at": n.updated_at.isoformat() if n.updated_at else None,
            }
            for n in notes
        ],
        "bookmarks": [b.lesson_path for b in bookmarks],
        "progress": [
            {
                "lesson_path": p.lesson_path,
                "completed_at": p.completed_at.isoformat() if p.completed_at else None,
            }
            for p in progress
        ],
    }

    return Response(
        json.dumps(payload, indent=2),
        mimetype="application/json",
        headers={"Content-Disposition": f"attachment; filename=datadrix-backup-{current_user.id}.json"},
    )


@dashboard_bp.route("/import-data", methods=["POST"])
@login_required
def import_data():
    """Restore notes, bookmarks, and completed lesson progress from a JSON backup."""
    import json
    file = request.files.get("backup_file")
    if not file or not file.filename.endswith(".json"):
        flash("Please choose a valid JSON backup file.", "danger")
        return redirect(url_for("dashboard.profile"))

    try:
        data = json.load(file)
    except Exception as e:
        flash(f"Error parsing JSON backup: {e}", "danger")
        return redirect(url_for("dashboard.profile"))

    imported_notes = 0
    imported_bookmarks = 0
    imported_progress = 0

    # 1. Notes
    for n in data.get("notes", []):
        title = (n.get("title") or "").strip()
        body = n.get("body") or ""
        if title:
            existing = Note.query.filter_by(user_id=current_user.id, title=title).first()
            if not existing:
                new_note = Note(user_id=current_user.id, title=title, body=body)
                db.session.add(new_note)
                imported_notes += 1

    # 2. Bookmarks
    for path in data.get("bookmarks", []):
        if path and not Bookmark.query.filter_by(user_id=current_user.id, lesson_path=path).first():
            db.session.add(Bookmark(user_id=current_user.id, lesson_path=path))
            imported_bookmarks += 1

    # 3. Progress
    for p in data.get("progress", []):
        path = p.get("lesson_path") if isinstance(p, dict) else p
        if path and not Progress.query.filter_by(user_id=current_user.id, lesson_path=path).first():
            db.session.add(Progress(user_id=current_user.id, lesson_path=path))
            imported_progress += 1

    db.session.commit()
    flash(
        f"Data restored: {imported_notes} notes, {imported_bookmarks} bookmarks, {imported_progress} lessons updated.",
        "success",
    )
    return redirect(url_for("dashboard.profile"))


@dashboard_bp.route("/certificate/<subject_slug>")
@login_required
def certificate(subject_slug):
    """View and print a personalized completion certificate for a given subject."""
    import hashlib
    subject_tree = build_subject_tree(subject_slug)
    total_lessons = sum(len(s["lessons"]) for s in subject_tree["sections"])

    user_progress = Progress.query.filter(
        Progress.user_id == current_user.id,
        Progress.lesson_path.like(f"{subject_slug}/%"),
    ).all()
    completed_count = len(user_progress)
    percentage = int((completed_count / total_lessons * 100)) if total_lessons > 0 else 0

    cert_hash = hashlib.sha256(f"{current_user.id}-{subject_slug}-datadrix".encode()).hexdigest()[:8].upper()
    cert_id = f"DDX-{subject_slug.upper()[:4]}-{cert_hash}"

    return render_template(
        "dashboard/certificate.html",
        subject=subject_tree,
        subject_slug=subject_slug,
        total_lessons=total_lessons,
        completed_count=completed_count,
        percentage=percentage,
        cert_id=cert_id,
        issue_date=datetime.now(timezone.utc).strftime("%B %d, %Y"),
    )

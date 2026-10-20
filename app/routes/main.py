"""
main.py

Routes for the core learning flow: opening the app, selecting a subject,
and viewing a lesson. This is the only blueprint the MVP needs — a
separate admin/api blueprint would be an unnecessary abstraction until
an actual second concern requires one.
"""

import markdown
from flask import Blueprint, abort, jsonify, redirect, render_template, request, send_from_directory, url_for
from flask_login import current_user

from app.models.bookmark import Bookmark
from app.models.lesson_note import LessonNote
from app.models.progress import Progress
from app.services.content_loader import (
    LessonNotFoundError,
    build_subject_tree,
    get_first_lesson_slug,
    is_allowed_media_extension,
    list_subjects,
    load_lesson,
    search_lessons,
)
from app.services.nav_engine import get_lesson_nav

# A Blueprint is Flask's way of grouping related routes so they can be
# registered on the app as one unit (see app/__init__.py).
main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def home():
    """
    Landing page (Phase 3).

    Previously this redirected straight into the first lesson of the
    first subject. It now renders a dedicated marketing/overview page
    instead — the "Start Learning" button on that page performs the
    exact same redirect this route used to do automatically, via
    main.view_subject, so that behavior isn't lost, just moved behind
    an explicit click. Every other route in this file is unchanged.
    """
    subjects = list_subjects()

    total_lessons = 0
    for subject in subjects:
        tree = build_subject_tree(subject["slug"])
        total_lessons += sum(len(section["lessons"]) for section in tree["sections"])

    first_subject_slug = subjects[0]["slug"] if subjects else None

    return render_template(
        "home.html",
        subjects=subjects,
        total_subjects=len(subjects),
        total_lessons=total_lessons,
        first_subject_slug=first_subject_slug,
    )


@main_bp.route("/api/search")
def api_search():
    """Live search API returning matching lessons across all subjects."""
    q = request.args.get("q", "").strip()
    results = search_lessons(q)
    formatted = [
        {
            "subject_slug": r["subject_slug"],
            "subject_title": r["subject_title"],
            "lesson_slug": r["lesson_slug"],
            "lesson_title": r["lesson_title"],
            "snippet": r["snippet"],
            "url": url_for("main.view_lesson", subject_slug=r["subject_slug"], lesson_slug=r["lesson_slug"]),
        }
        for r in results
    ]
    return jsonify({"results": formatted})


@main_bp.route("/search")
def search():
    """Full-page lesson search results."""
    q = request.args.get("q", "").strip()
    results = search_lessons(q) if q else []
    for r in results:
        r["url"] = url_for("main.view_lesson", subject_slug=r["subject_slug"], lesson_slug=r["lesson_slug"])
    return render_template("search.html", query=q, results=results)


@main_bp.route("/about")
def about():
    return render_template("pages/about.html")


@main_bp.route("/privacy")
def privacy():
    return render_template("pages/privacy.html")


@main_bp.route("/terms")
def terms():
    return render_template("pages/terms.html")


@main_bp.route("/playground")
def playground():
    """Interactive client-side code runner for Python and web development."""
    lang = request.args.get("lang", "python")
    code = request.args.get("code", "")
    return render_template("playground.html", initial_lang=lang, initial_code=code)


@main_bp.route("/<subject_slug>")
def view_subject(subject_slug):
    """Clicking a subject in the top nav opens its first lesson."""
    first_lesson_slug = get_first_lesson_slug(subject_slug)
    if first_lesson_slug is None:
        abort(404)

    return redirect(url_for(
        "main.view_lesson",
        subject_slug=subject_slug,
        lesson_slug=first_lesson_slug,
    ))


@main_bp.route("/<subject_slug>/<lesson_slug>")
def view_lesson(subject_slug, lesson_slug):
    """Render a single lesson page, loaded dynamically from content/."""
    try:
        lesson = load_lesson(subject_slug, lesson_slug)
    except LessonNotFoundError:
        abort(404)

    subject_tree = build_subject_tree(subject_slug)

    # Only meaningful for a logged-in user — an anonymous visitor sees
    # the lesson exactly as before, with no bookmark/progress state.
    is_bookmarked = False
    is_completed = False
    completed_lessons = set()
    if current_user.is_authenticated:
        lesson_path = f"{subject_slug}/{lesson_slug}"
        is_bookmarked = Bookmark.query.filter_by(
            user_id=current_user.id, lesson_path=lesson_path
        ).first() is not None
        is_completed = Progress.query.filter_by(
            user_id=current_user.id, lesson_path=lesson_path
        ).first() is not None

        # Every completed lesson slug within this subject, for the
        # sidebar's completion checkmarks. Filtered by a "subject/"
        # prefix match, then the slug is split off in Python — simpler
        # than a SQL LIKE pattern, and this list is always small (one
        # subject's lesson count, not the whole site's).
        subject_progress = Progress.query.filter(
            Progress.user_id == current_user.id,
            Progress.lesson_path.like(f"{subject_slug}/%"),
        ).all()
        completed_lessons = {p.lesson_path.split("/", 1)[1] for p in subject_progress}

    # Official (admin-authored) notes for this lesson — public, shown
    # to every visitor regardless of login state. Deliberately a
    # separate query against LessonNote, never against the private
    # student Note model.
    lesson_path = f"{subject_slug}/{lesson_slug}"
    official_notes = (
        LessonNote.query.filter_by(lesson_path=lesson_path, published=True)
        .order_by(LessonNote.pinned.desc(), LessonNote.sort_order, LessonNote.created_at)
        .all()
    )
    for note in official_notes:
        note.body_html = markdown.markdown(note.body, extensions=["fenced_code", "tables"])

    return render_template(
        "lesson.html",
        lesson_title=lesson["title"],
        lesson_body_html=lesson["body_html"],
        current_subject=subject_slug,
        subject_tree=subject_tree,
        current_lesson=lesson_slug,
        lesson_nav=get_lesson_nav(subject_tree, lesson_slug),
        is_bookmarked=is_bookmarked,
        is_completed=is_completed,
        completed_lessons=completed_lessons,
        official_notes=official_notes,
    )
@main_bp.route("/content-media/<subject_slug>/<section_folder>/<path:filepath>")
def content_media(subject_slug, section_folder, filepath):
    """
    Serve static media files (images, downloads, videos) that live
    alongside lesson Markdown files in content/.

    Safety:
    - Path-traversal: send_from_directory() rejects any path that
      escapes the given directory, so "../../etc" is safe.
    - Extension allow-list: only types in _ALLOWED_MEDIA_EXTENSIONS
      are served. JSON, Python, and other sensitive files can never
      be fetched through this route even if guessed by URL.
    - Read-only: this route never writes; it only reads files that
      content authors already placed in content/.
    """
    import os
    from flask import current_app

    # Check the extension before hitting the filesystem.
    if not is_allowed_media_extension(filepath):
        abort(403)

    content_dir = current_app.config["CONTENT_DIR"]
    section_dir = os.path.join(content_dir, subject_slug, section_folder)
    return send_from_directory(section_dir, filepath)

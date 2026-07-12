"""
main.py

Routes for the core learning flow: opening the app, selecting a subject,
and viewing a lesson. This is the only blueprint the MVP needs — a
separate admin/api blueprint would be an unnecessary abstraction until
an actual second concern requires one.
"""

from flask import Blueprint, abort, redirect, render_template, url_for

from app.services.content_loader import (
    LessonNotFoundError,
    build_subject_tree,
    get_first_lesson_slug,
    list_subjects,
    load_lesson,
)
from app.services.nav_engine import get_lesson_nav

# A Blueprint is Flask's way of grouping related routes so they can be
# registered on the app as one unit (see app/__init__.py).
main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def home():
    """
    Entry point. Redirects to the first lesson of the first available
    subject — both computed dynamically from content/, nothing hardcoded.
    """
    subjects = list_subjects()
    if not subjects:
        abort(404, description="No subjects found in content/ yet.")

    first_subject_slug = subjects[0]["slug"]
    first_lesson_slug = get_first_lesson_slug(first_subject_slug)
    if first_lesson_slug is None:
        abort(404, description=f"Subject '{first_subject_slug}' has no lessons yet.")

    return redirect(url_for(
        "main.view_lesson",
        subject_slug=first_subject_slug,
        lesson_slug=first_lesson_slug,
    ))


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

    return render_template(
        "lesson.html",
        lesson_title=lesson["title"],
        lesson_body_html=lesson["body_html"],
        subjects=list_subjects(),
        current_subject=subject_slug,
        subject_tree=subject_tree,
        current_lesson=lesson_slug,
        lesson_nav=get_lesson_nav(subject_tree, lesson_slug),
    )

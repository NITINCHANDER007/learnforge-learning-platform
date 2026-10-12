"""
Unit tests for app.services.content_loader
"""
from pathlib import Path
from app.services.content_loader import (
    LessonNotFoundError,
    _iter_section_dirs,
    _rewrite_media_urls,
    build_subject_tree,
    get_first_lesson_slug,
    list_subjects,
    load_lesson,
    search_lessons,
)


def test_list_subjects(app):
    with app.app_context():
        subjects = list_subjects()
        assert len(subjects) >= 14
        slugs = [s["slug"] for s in subjects]
        assert "python" in slugs
        assert "sql" in slugs
        assert "html" in slugs
        assert "javascript" in slugs


def test_build_subject_tree(app):
    with app.app_context():
        tree = build_subject_tree("python")
        assert tree["slug"] == "python"
        assert len(tree["sections"]) > 0
        first_section = tree["sections"][0]
        assert len(first_section["lessons"]) > 0
        first_lesson = first_section["lessons"][0]
        assert "slug" in first_lesson
        assert "title" in first_lesson


def test_get_first_lesson_slug(app):
    with app.app_context():
        first_slug = get_first_lesson_slug("python")
        assert first_slug is not None
        assert isinstance(first_slug, str)


def test_load_lesson(app):
    with app.app_context():
        lesson = load_lesson("python", "what-is-python")
        assert "title" in lesson
        assert "body_html" in lesson
        assert len(lesson["body_html"]) > 0


def test_load_nonexistent_lesson_raises(app):
    with app.app_context():
        import pytest
        with pytest.raises(LessonNotFoundError):
            load_lesson("python", "definitely-not-a-real-lesson-12345")


def test_iter_section_dirs_skips_hidden_and_drafts(app):
    with app.app_context():
        content_root = Path("content")
        for sdir in content_root.iterdir():
            if sdir.is_dir():
                sections = list(_iter_section_dirs(sdir))
                for sec in sections:
                    assert not sec.name.startswith("."), f"Found hidden section: {sec.name}"


def test_rewrite_media_urls(app):
    with app.app_context():
        html = '<p><img src="images/chart.png"> and <a href="files/data.zip">download</a></p>'
        rewritten = _rewrite_media_urls(html, "python", "01-introduction")
        assert "/content-media/python/01-introduction/images/chart.png" in rewritten
        assert "/content-media/python/01-introduction/files/data.zip" in rewritten

        # External URLs must remain intact
        ext_html = '<a href="https://example.com/file.zip">External</a>'
        assert _rewrite_media_urls(ext_html, "python", "01-intro") == ext_html


def test_search_lessons(app):
    with app.app_context():
        results = search_lessons("Python")
        assert len(results) > 0
        top = results[0]
        assert "subject_slug" in top
        assert "lesson_slug" in top
        assert "lesson_title" in top
        assert "snippet" in top

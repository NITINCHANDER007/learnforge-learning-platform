"""
Unit tests for app.services.nav_engine
"""
from app.services.content_loader import build_subject_tree
from app.services.nav_engine import get_lesson_nav


def test_nav_engine_first_lesson(app):
    with app.app_context():
        tree = build_subject_tree("python")
        first_lesson_slug = tree["sections"][0]["lessons"][0]["slug"]
        nav = get_lesson_nav(tree, first_lesson_slug)
        assert nav["previous"] is None
        assert nav["next"] is not None
        assert "slug" in nav["next"]
        assert "title" in nav["next"]


def test_nav_engine_last_lesson(app):
    with app.app_context():
        tree = build_subject_tree("python")
        last_section = tree["sections"][-1]
        last_lesson_slug = last_section["lessons"][-1]["slug"]
        nav = get_lesson_nav(tree, last_lesson_slug)
        assert nav["next"] is None
        assert nav["previous"] is not None


def test_nav_engine_section_transition(app):
    with app.app_context():
        tree = build_subject_tree("python")
        if len(tree["sections"]) >= 2:
            # End of first section
            first_sec_last = tree["sections"][0]["lessons"][-1]["slug"]
            second_sec_first = tree["sections"][1]["lessons"][0]["slug"]

            nav = get_lesson_nav(tree, first_sec_last)
            assert nav["next"] is not None
            assert nav["next"]["slug"] == second_sec_first

            nav2 = get_lesson_nav(tree, second_sec_first)
            assert nav2["previous"] is not None
            assert nav2["previous"]["slug"] == first_sec_last


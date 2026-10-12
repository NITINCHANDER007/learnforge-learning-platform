"""
Tests for admin content_manager operations: publish/unpublish, duplicate, drafts.
"""
from pathlib import Path
from app.admin import content_manager


def test_lesson_lifecycle(app):
    with app.app_context():
        subject_slug = "python"
        section_folder = "01-introduction"
        title = "Test Automation Lifecycle Lesson"
        body = "# Hello World\n\nThis is a temporary test lesson."

        # 1. Create lesson
        filename = content_manager.create_lesson(subject_slug, section_folder, title, body)
        assert filename is not None
        assert content_manager.is_lesson_published(subject_slug, section_folder, filename) is True

        # 2. Toggle to draft (unpublish)
        now_pub = content_manager.toggle_publish(subject_slug, section_folder, filename)
        assert now_pub is False
        assert content_manager.is_lesson_published(subject_slug, section_folder, filename) is False

        # Verify it is now in .drafts folder on disk
        draft_path = Path("content") / subject_slug / section_folder / ".drafts" / filename
        assert draft_path.is_file()

        # 3. Toggle back to published
        now_pub = content_manager.toggle_publish(subject_slug, section_folder, filename)
        assert now_pub is True
        pub_path = Path("content") / subject_slug / section_folder / filename
        assert pub_path.is_file()

        # 4. Clean up / delete
        content_manager.delete_lesson(subject_slug, section_folder, filename)
        assert not pub_path.is_file()

"""
Tests for note separation: official admin notes vs private student notes.
"""
from app.models.lesson_note import LessonNote
from app.models.note import Note


def test_note_model_separation(db, student_user, admin_user):
    # Official note
    official = LessonNote(
        lesson_path="python/what-is-python",
        title="Official Key Concepts",
        body="Key concepts summary...",
        published=True,
        pinned=True,
        author_id=admin_user.id,
    )
    db.session.add(official)

    # Student private note
    student_note = Note(
        user_id=student_user.id,
        title="Personal Variables Note",
        body="My personal thoughts on variables",
    )
    db.session.add(student_note)
    db.session.commit()

    # Querying LessonNote never returns Note
    assert LessonNote.query.count() == 1
    assert Note.query.count() == 1

    queried_official = LessonNote.query.first()
    assert queried_official.title == "Official Key Concepts"

    queried_student = Note.query.first()
    assert queried_student.user_id == student_user.id

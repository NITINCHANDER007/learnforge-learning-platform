"""
Tests for uploaded files privacy and content media serving rules.
"""


def test_private_note_upload_privacy_for_anonymous(client):
    r = client.get("/uploads/notes/1/test_private.pdf")
    assert r.status_code == 401


def test_private_note_upload_privacy_for_other_student(client, student_user, student2_user):
    # Login as student 1
    client.post("/auth/login", data={"email": student_user.email, "password": "studentpassword123"})

    # Try to access student 2's note file
    r = client.get(f"/uploads/notes/{student2_user.id}/secret.pdf")
    assert r.status_code == 403


def test_lesson_notes_uploads_accessible(client):
    # Public official lesson note files are not blocked by 401/403
    r = client.get("/uploads/lesson_notes/nonexistent.pdf")
    assert r.status_code in (200, 404)


def test_content_media_disallowed_extension(client):
    # .json or .py or .env must be blocked with 403
    r = client.get("/content-media/python/01-introduction/subject.json")
    assert r.status_code == 403

    r = client.get("/content-media/python/01-introduction/script.py")
    assert r.status_code == 403


def test_content_media_path_traversal_blocked(client):
    # Path traversal should be 403 or 404
    r = client.get("/content-media/python/01-introduction/../../app/config.py")
    assert r.status_code in (403, 404)

"""
Tests for DataDrix features:
- Interactive code playground
- Progress & notes backup export & import
- Subject completion certificate generator
"""
import io
import json
from app.models.note import Note
from app.models.bookmark import Bookmark
from app.models.progress import Progress


def test_playground_route(client):
    response = client.get("/playground")
    assert response.status_code == 200
    assert b"Interactive Playground" in response.data
    assert b"Pyodide" in response.data or b"Python" in response.data


def test_export_data_requires_auth(client):
    response = client.get("/dashboard/export-data")
    assert response.status_code == 302


def test_export_and_import_data(auth_student_client, student_user, db):
    # Create sample note, bookmark, progress
    note = Note(user_id=student_user.id, title="Test Note", body="Content")
    bm = Bookmark(user_id=student_user.id, lesson_path="python/what-is-python")
    prog = Progress(user_id=student_user.id, lesson_path="python/what-is-python")
    db.session.add_all([note, bm, prog])
    db.session.commit()

    # Export
    resp = auth_student_client.get("/dashboard/export-data")
    assert resp.status_code == 200
    assert resp.content_type == "application/json"
    data = json.loads(resp.data)
    assert data["platform"] == "DataDrix"
    assert len(data["notes"]) >= 1
    assert "python/what-is-python" in data["bookmarks"]

    # Clear and test import
    db.session.delete(note)
    db.session.delete(bm)
    db.session.delete(prog)
    db.session.commit()

    backup_payload = {
        "version": "1.0",
        "notes": [{"title": "Restored Note", "body": "Restored Body"}],
        "bookmarks": ["python/variables-and-data-types"],
        "progress": [{"lesson_path": "python/variables-and-data-types"}],
    }
    backup_file = (io.BytesIO(json.dumps(backup_payload).encode()), "backup.json")
    import_resp = auth_student_client.post(
        "/dashboard/import-data",
        data={"backup_file": backup_file},
        content_type="multipart/form-data",
        follow_redirects=True,
    )
    assert import_resp.status_code == 200
    assert Note.query.filter_by(user_id=student_user.id, title="Restored Note").first() is not None
    assert Bookmark.query.filter_by(user_id=student_user.id, lesson_path="python/variables-and-data-types").first() is not None


def test_certificate_generator(auth_student_client, student_user, db):
    prog = Progress(user_id=student_user.id, lesson_path="python/what-is-python")
    db.session.add(prog)
    db.session.commit()

    resp = auth_student_client.get("/dashboard/certificate/python")
    assert resp.status_code == 200
    assert b"Certificate of Completion" in resp.data
    assert b"DataDrix" in resp.data
    assert b"DDX-PYTH" in resp.data

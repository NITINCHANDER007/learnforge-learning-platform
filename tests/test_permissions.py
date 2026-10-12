"""
Tests for role permissions and student data boundaries.
"""
from app.models.note import Note


def test_student_gets_403_on_admin_routes(auth_student_client):
    admin_routes = [
        "/admin/",
        "/admin/users",
        "/admin/content",
        "/admin/analytics",
        "/admin/notes",
    ]
    for route in admin_routes:
        r = auth_student_client.get(route)
        assert r.status_code == 403, f"Expected 403 on {route}, got {r.status_code}"


def test_admin_can_access_admin_routes(auth_admin_client):
    admin_routes = [
        "/admin/",
        "/admin/users",
        "/admin/content",
        "/admin/analytics",
        "/admin/notes",
    ]
    for route in admin_routes:
        r = auth_admin_client.get(route)
        assert r.status_code == 200, f"Expected 200 on {route}, got {r.status_code}"


def test_student_cannot_access_or_modify_other_student_note(client, db, student_user, student2_user):
    # Create private note belonging to student 2
    note2 = Note(
        user_id=student2_user.id,
        title="Student 2 Secret Note",
        body="Secret note by student 2",
    )
    db.session.add(note2)
    db.session.commit()
    note_id = note2.id

    # Login as student 1
    client.post("/auth/login", data={"email": student_user.email, "password": "studentpassword123"})

    # Student 1 tries to delete student 2's note -> 404 or 403 (owner scoped)
    r = client.post(f"/dashboard/notes/{note_id}/delete")
    assert r.status_code in (403, 404)

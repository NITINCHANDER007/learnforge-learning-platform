"""
Unit and integration tests for authentication and account security.
"""
from app.auth.routes import _FAILED_LOGINS, generate_reset_token, verify_reset_token
from app.models.user import User


def test_register_flow(client, db):
    r = client.post("/auth/register", data={
        "name": "New User",
        "email": "newuser@test.com",
        "password": "strongpassword123",
        "confirm_password": "strongpassword123",
    }, follow_redirects=True)
    assert r.status_code == 200

    u = User.query.filter_by(email="newuser@test.com").first()
    assert u is not None
    assert u.name == "New User"
    assert u.role == "student"
    assert u.is_active is True
    assert u.check_password("strongpassword123")


def test_login_logout(client, student_user):
    # Login
    r = client.post("/auth/login", data={
        "email": student_user.email,
        "password": "studentpassword123",
    }, follow_redirects=True)
    assert r.status_code == 200

    # Logout
    r = client.get("/auth/logout", follow_redirects=True)
    assert r.status_code == 200


def test_deactivated_user_cannot_login(client, db, student_user):
    student_user.is_active = False
    db.session.commit()

    r = client.post("/auth/login", data={
        "email": student_user.email,
        "password": "studentpassword123",
    }, follow_redirects=True)
    data = r.data.decode("utf-8", errors="replace")
    assert "deactivated" in data.lower()


def test_login_rate_limiting_lockout(client, student_user):
    _FAILED_LOGINS.clear()

    # 4 bad attempts
    for _ in range(4):
        r = client.post("/auth/login", data={
            "email": student_user.email,
            "password": "wrongpassword",
        })
        assert r.status_code == 200

    # 5th bad attempt triggers lockout
    client.post("/auth/login", data={
        "email": student_user.email,
        "password": "wrongpassword",
    })

    # 6th attempt should be locked out with HTTP 429
    r = client.post("/auth/login", data={
        "email": student_user.email,
        "password": "studentpassword123",
    })
    assert r.status_code == 429
    data = r.data.decode("utf-8", errors="replace")
    assert "too many failed" in data.lower()

    _FAILED_LOGINS.clear()


def test_password_reset_token(app, student_user):
    with app.app_context():
        token = generate_reset_token(student_user.id)
        assert token is not None
        user_id = verify_reset_token(token)
        assert user_id == student_user.id

        # Bad token returns None
        assert verify_reset_token("invalid-token") is None

"""
Pytest configuration and shared test fixtures.
"""
import os
import pytest
from app import create_app
from app.extensions import db as _db
from app.models.user import User


@pytest.fixture(scope="session")
def app():
    os.environ["SECRET_KEY"] = "test-secret-key-12345"
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "WTF_CSRF_ENABLED": False,
        "SERVER_NAME": "localhost",
    })

    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()


@pytest.fixture(scope="function")
def db(app):
    with app.app_context():
        _db.session.rollback()
        # Clean existing test records
        for table in reversed(_db.metadata.sorted_tables):
            _db.session.execute(table.delete())
        _db.session.commit()
        yield _db


@pytest.fixture
def client(app, db):
    return app.test_client()


@pytest.fixture
def student_user(db):
    user = User(name="Alice Student", email="alice@test.com", role="student", is_active=True)
    user.set_password("studentpassword123")
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def student2_user(db):
    user = User(name="Bob Student", email="bob@test.com", role="student", is_active=True)
    user.set_password("studentpassword123")
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def admin_user(db):
    user = User(name="Admin User", email="admin@test.com", role="admin", is_active=True)
    user.set_password("adminpassword123")
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def auth_student_client(client, student_user):
    client.post("/auth/login", data={"email": student_user.email, "password": "studentpassword123"})
    return client


@pytest.fixture
def auth_admin_client(client, admin_user):
    client.post("/auth/login", data={"email": admin_user.email, "password": "adminpassword123"})
    return client

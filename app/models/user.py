"""
models/user.py

The User model — the only table this milestone needs. UserMixin (from
Flask-Login) provides is_authenticated, is_active, is_anonymous, and
get_id() for free, which is what lets Flask-Login treat a User instance
as a "logged-in session" without us writing that logic by hand.

Passwords are never stored directly — only a salted hash, via Werkzeug's
generate_password_hash/check_password_hash (already a Flask dependency,
so this needs no new library).
"""

from datetime import datetime, timezone

from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db, login_manager

VALID_ROLES = ("student", "admin")


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    # A plain string column rather than a database-level enum: with only
    # two roles today, a Python-level check (see is_admin below) is
    # simpler and avoids a migration if a role is ever renamed — matches
    # the project's standing "don't over-engineer" rule.
    role = db.Column(db.String(20), nullable=False, default="student")

    # Deactivated accounts cannot log in. Default True so existing users
    # stay active after the column is added by migration.
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_admin(self):
        return self.role == "admin"

    def __repr__(self):
        return f"<User {self.email}>"


@login_manager.user_loader
def load_user(user_id):
    """
    Flask-Login calls this on every request for a logged-in user, to
    turn the ID stored in their session cookie back into a real User
    object (available afterward as `current_user`).
    """
    return User.query.get(int(user_id))

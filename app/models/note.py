"""
models/note.py

A student's personal note — free-form text, optionally with one
uploaded file attached. attachment_path stores a path relative to the
uploads/ folder (see app/uploads/routes.py for how it's served), not an
absolute filesystem path — keeps the stored value portable across
environments (local disk path differs from Render's).
"""

from datetime import datetime, timezone

from app.extensions import db


class Note(db.Model):
    __tablename__ = "notes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, nullable=False, default="")
    attachment_path = db.Column(db.String(500), nullable=True)

    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    author = db.relationship("User", backref=db.backref("notes", lazy="dynamic", cascade="all, delete-orphan"))

    def __repr__(self):
        return f"<Note {self.id} '{self.title}'>"

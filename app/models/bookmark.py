"""
models/bookmark.py

Same lesson_path-as-string pattern as Progress — see that module's
docstring for the reasoning.
"""

from datetime import datetime, timezone

from app.extensions import db


class Bookmark(db.Model):
    __tablename__ = "bookmarks"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    lesson_path = db.Column(db.String(255), nullable=False)
    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    user = db.relationship("User", backref=db.backref("bookmark_records", lazy="dynamic", cascade="all, delete-orphan"))

    __table_args__ = (
        db.UniqueConstraint("user_id", "lesson_path", name="uq_user_lesson_bookmark"),
    )

    def __repr__(self):
        return f"<Bookmark user={self.user_id} lesson={self.lesson_path}>"

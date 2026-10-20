"""
models/progress.py

Tracks which lessons a user has marked as complete. lesson_path is a
plain string like "python/variables" — the same subject_slug/lesson_slug
pair used in the URL — not a foreign key to a "lessons" table, because
lessons aren't database rows; they're Markdown files. This keeps the
database and the content system fully decoupled, exactly as the
original architecture intended.
"""

from datetime import datetime, timezone

from app.extensions import db


class Progress(db.Model):
    __tablename__ = "progress"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    lesson_path = db.Column(db.String(255), nullable=False)
    completed_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    user = db.relationship("User", backref=db.backref("progress_records", lazy="dynamic", cascade="all, delete-orphan"))

    __table_args__ = (
        # A user can only have one progress record per lesson — prevents
        # duplicate rows if "mark complete" is clicked more than once.
        db.UniqueConstraint("user_id", "lesson_path", name="uq_user_lesson_progress"),
    )

    def __repr__(self):
        return f"<Progress user={self.user_id} lesson={self.lesson_path}>"

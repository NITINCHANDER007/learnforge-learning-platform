"""
models/lesson_note.py

An OFFICIAL note attached to a lesson, authored by an admin, visible to
every visitor of that lesson. This is deliberately a separate model
and table from Note (app/models/note.py) — that model is a student's
private note, owned by one user and never shown to anyone else. This
model is the opposite: owned by no one specific student, shown to
everyone. Keeping them as two distinct tables (rather than one "notes"
table with an is_public flag) makes it structurally impossible for a
private student note to accidentally leak into a public listing, or
for a student to accidentally query/edit an official note — the two
code paths never touch the same table at all.

lesson_path follows the same "subject/lesson" string convention used
by Progress and Bookmark — not a foreign key to a "lessons" table,
since lessons are Markdown files, not database rows.
"""

from datetime import datetime, timezone

from app.extensions import db


class LessonNote(db.Model):
    __tablename__ = "lesson_notes"

    id = db.Column(db.Integer, primary_key=True)
    lesson_path = db.Column(db.String(255), nullable=False, index=True)

    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, nullable=False, default="")
    attachment_path = db.Column(db.String(500), nullable=True)

    published = db.Column(db.Boolean, nullable=False, default=True)
    pinned = db.Column(db.Boolean, nullable=False, default=False)
    # Lower numbers show first; ties broken by created_at. A plain
    # integer column is enough for admin-driven reordering — no need
    # for a more elaborate ordering scheme with so few notes per lesson.
    sort_order = db.Column(db.Integer, nullable=False, default=0)

    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    author = db.relationship("User", backref=db.backref("lesson_notes", lazy="dynamic"))

    def __repr__(self):
        return f"<LessonNote {self.id} on {self.lesson_path}>"

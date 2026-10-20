"""
models/__init__.py

Importing this package (from the app factory) ensures every model module
below is imported, which registers each model's table with SQLAlchemy —
required before db.create_all() or a Flask-Migrate migration can see them.

As new models are added in later milestones (Progress, Bookmark, Note),
import them here too.
"""

from app.models.user import User  # noqa: F401
from app.models.progress import Progress  # noqa: F401
from app.models.bookmark import Bookmark  # noqa: F401
from app.models.note import Note  # noqa: F401
from app.models.lesson_note import LessonNote  # noqa: F401

"""
config.py

Central place for app-wide settings. Values come from environment
variables where they're secrets or environment-specific (database URL,
secret key), with safe local-development defaults so the app still runs
with zero setup — matching how this project has worked from Milestone 0.
"""

import os

from dotenv import load_dotenv

# Loads a local .env file into environment variables, if one exists.
# Has no effect in production (Render sets real environment variables
# directly, there's no .env file on the server) — this is purely a
# local development convenience.
load_dotenv()


def _normalize_database_url(url):
    """
    Render (and Heroku before it) sometimes provides a DATABASE_URL
    starting with "postgres://", but SQLAlchemy 1.4+ requires the
    "postgresql://" scheme. Without this fix, a real production database
    URL would cause a startup crash — this is a well-known, specific
    gotcha worth handling defensively rather than discovering it live.
    """
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


class Config:
    CONTENT_DIR = "content"  # relative path to the content/ folder

    # Signs session cookies (used by Flask-Login) and CSRF tokens (used by
    # Flask-WTF). The default below is fine for local development only —
    # production must set a real SECRET_KEY environment variable.
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")

    # Falls back to a local SQLite file if DATABASE_URL isn't set, so the
    # app runs with zero database setup during local development. Render
    # provides a real DATABASE_URL automatically once a PostgreSQL
    # instance is attached to the service.
    SQLALCHEMY_DATABASE_URI = _normalize_database_url(
        os.environ.get("DATABASE_URL", "sqlite:///learnforge.db")
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # unnecessary overhead we don't need

    # Where user-uploaded files (note attachments) are stored — separate
    # from content/, which is reserved for the Markdown lesson system.
    UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", "uploads")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB upload limit, applied globally by Flask

    # Production hardening
    FLASK_ENV = os.environ.get("FLASK_ENV", "development")
    IS_PRODUCTION = os.environ.get("RENDER") is not None or FLASK_ENV == "production"

    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = IS_PRODUCTION
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SECURE = IS_PRODUCTION
    REMEMBER_COOKIE_SAMESITE = "Lax"


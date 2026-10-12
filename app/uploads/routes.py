"""
uploads/routes.py

Serves files from UPLOAD_FOLDER. Two kinds of uploads live here, with
different visibility:
  - notes/<user_id>/...        private student note attachments (owner or admin only)
  - lesson_notes/...            public official lesson note attachments

This is a separate route rather than putting uploads inside app/static/
because static files are meant to be part of the deployed application
itself (checked into git, same on every deploy) — user uploads are
runtime data that changes per-user and shouldn't be bundled with the
app's own assets.
"""

from flask import Blueprint, abort, current_app, send_from_directory
from flask_login import current_user

uploads_bp = Blueprint("uploads", __name__, url_prefix="/uploads")


@uploads_bp.route("/<path:filepath>")
def serve_upload(filepath):
    """
    Serve uploaded files with two-tier access control:

    1. lesson_notes/* — public; every visitor can reach an official
       lesson-note attachment the same way they see the note itself.
    2. notes/<user_id>/* — private; only the note's owner or an admin
       can fetch it. Checking the user_id directory prefix enforces
       this at the URL level: storage.save_uploaded_file() always
       stores private attachments under notes/<current_user.id>/,
       so the path segment directly identifies the owning user.
    3. Anything else under uploads/ — requires login at minimum.
    """
    if filepath.startswith("lesson_notes/"):
        # Public — official lesson notes visible to all visitors.
        return send_from_directory(current_app.config["UPLOAD_FOLDER"], filepath)

    if not current_user.is_authenticated:
        abort(401)

    if filepath.startswith("notes/"):
        # Private note attachment — enforce owner-or-admin.
        parts = filepath.split("/", 2)  # ["notes", "<user_id>", "filename"]
        if len(parts) >= 2:
            try:
                owner_id = int(parts[1])
            except ValueError:
                abort(403)
            if not current_user.is_admin and current_user.id != owner_id:
                abort(403)

    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filepath)

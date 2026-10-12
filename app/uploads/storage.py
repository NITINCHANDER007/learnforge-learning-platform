"""
uploads/storage.py

A small shared helper for saving uploaded files safely. Used by both
student notes (Milestone 3) and admin lesson content management
(Milestone 4) — kept as one function here rather than duplicated in
both blueprints.
"""

import os
import uuid

from flask import current_app
from werkzeug.utils import secure_filename


def save_uploaded_file(file_storage, subfolder):
    """
    Save an uploaded file under UPLOAD_FOLDER/<subfolder>/, with a
    collision-proof filename, and return the path relative to
    UPLOAD_FOLDER (what gets stored in the database or referenced from
    Markdown).

    Returns None if no file was actually provided (this is a normal,
    expected case for optional attachments — not an error).
    """
    if not file_storage or not file_storage.filename:
        return None

    original_name = secure_filename(file_storage.filename)
    # A random prefix avoids overwriting a different user's file that
    # happens to have the same original name (e.g. two people both
    # uploading "notes.pdf").
    unique_name = f"{uuid.uuid4().hex[:12]}_{original_name}"

    target_dir = os.path.join(current_app.config["UPLOAD_FOLDER"], subfolder)
    os.makedirs(target_dir, exist_ok=True)

    file_storage.save(os.path.join(target_dir, unique_name))

    return f"{subfolder}/{unique_name}"

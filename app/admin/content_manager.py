"""
admin/content_manager.py

Write-side operations on content/ for the admin dashboard: creating and
editing subjects/sections/lessons, and publish/unpublish.

This is deliberately kept separate from services/content_loader.py,
which stays untouched and read-only. The two modules share the same
on-disk conventions (numeric filename prefixes for order, subject.json/
section.json for titles) but serve different concerns — one renders
content for visitors, this one lets an admin author it.

PUBLISH / UNPUBLISH DESIGN:
A lesson is "published" when its .md file lives directly in its section
folder (where content_loader finds it), and "draft" when it's been moved
into a ".drafts" subfolder inside that section. content_loader only
globs direct children of a section folder ("*.md"), so anything inside
.drafts/ is invisible to it automatically — publish/unpublish is just
moving a file between these two locations. This means zero changes to
content_loader.py were needed to support publishing at all.
"""

import json
import re
import shutil
from pathlib import Path

from flask import current_app

_ORDER_PREFIX_PATTERN = re.compile(r"^\d+-")
_SLUG_PATTERN = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")


class ContentValidationError(Exception):
    """Raised when admin-supplied content data is invalid (bad slug, duplicate, etc.)."""


def _content_root():
    return Path(current_app.config["CONTENT_DIR"])


def _validate_slug(slug, label="Slug"):
    if not _SLUG_PATTERN.match(slug):
        raise ContentValidationError(
            f"{label} must be lowercase letters, numbers, and hyphens only (e.g. 'my-topic')."
        )


def _next_prefix(directory, pattern="*"):
    """
    Find the next available two-digit numeric prefix for a new
    folder/file in `directory`, based on the highest existing prefix.
    Scans both the directory itself and its .drafts subfolder (if any),
    so a published lesson and a draft can never collide on the same
    number once the draft is eventually published.
    """
    highest = 0
    locations = [directory]
    drafts_dir = directory / ".drafts"
    if drafts_dir.is_dir():
        locations.append(drafts_dir)

    for location in locations:
        if not location.is_dir():
            continue
        for entry in location.glob(pattern):
            match = re.match(r"^(\d+)-", entry.stem if entry.is_file() else entry.name)
            if match:
                highest = max(highest, int(match.group(1)))

    return f"{highest + 1:02d}"


# ---------- Subjects ----------

def list_all_subjects():
    """All subjects, regardless of whether subject.json exists yet — for
    the admin UI, unlike content_loader.list_subjects() which only shows
    publish-ready subjects to visitors. Ordered the same way visitors
    see them, so the reorder UI reflects reality."""
    root = _content_root()
    if not root.is_dir():
        return []

    def sort_key(subject_dir):
        subject_json = subject_dir / "subject.json"
        order = None
        if subject_json.is_file():
            metadata = json.loads(subject_json.read_text(encoding="utf-8"))
            order = metadata.get("order")
        return (order if isinstance(order, int) else 9999, subject_dir.name)

    return [d.name for d in sorted((d for d in root.iterdir() if d.is_dir()), key=sort_key)]


def create_subject(slug, title):
    slug = slug.strip().lower()
    _validate_slug(slug, "Subject slug")

    subject_dir = _content_root() / slug
    if subject_dir.exists():
        raise ContentValidationError(f"A subject folder named '{slug}' already exists.")

    subject_dir.mkdir(parents=True)
    (subject_dir / "subject.json").write_text(
        json.dumps({"title": title.strip()}, indent=4) + "\n", encoding="utf-8"
    )
    return slug


def delete_subject(subject_slug):
    subject_dir = _content_root() / subject_slug
    if not subject_dir.is_dir():
        raise ContentValidationError("Subject not found.")
    shutil.rmtree(subject_dir)


# ---------- Sections ----------

def create_section(subject_slug, title):
    subject_dir = _content_root() / subject_slug
    if not subject_dir.is_dir():
        raise ContentValidationError("Subject not found.")

    base_slug = re.sub(r"[^a-z0-9]+", "-", title.strip().lower()).strip("-")
    _validate_slug(base_slug, "Section title")

    prefix = _next_prefix(subject_dir, pattern="[0-9]*")
    section_slug = f"{prefix}-{base_slug}"
    section_dir = subject_dir / section_slug
    section_dir.mkdir(parents=True)

    (section_dir / "section.json").write_text(
        json.dumps({"title": title.strip()}, indent=4) + "\n", encoding="utf-8"
    )
    return section_slug


def delete_section(subject_slug, section_folder_name):
    section_dir = _content_root() / subject_slug / section_folder_name
    if not section_dir.is_dir():
        raise ContentValidationError("Section not found.")
    shutil.rmtree(section_dir)


def list_all_sections(subject_slug):
    """
    Every section folder in a subject, ordered the same way visitors
    see them (explicit "order" in section.json when present, else
    folder-name/prefix order) — so the reorder UI reflects reality.
    """
    subject_dir = _content_root() / subject_slug
    if not subject_dir.is_dir():
        return []

    def sort_key(section_dir):
        order = _read_json_order_local(section_dir / "section.json")
        return (order if order is not None else 9999, section_dir.name)

    return [
        d.name for d in sorted(
            (d for d in subject_dir.iterdir() if d.is_dir() and not d.name.startswith(".")),
            key=sort_key,
        )
    ]


def _read_json_order_local(json_path):
    """Same job as content_loader's private helper of the same purpose, kept local here to avoid reaching into that module's internals."""
    if not json_path.is_file():
        return None
    metadata = json.loads(json_path.read_text(encoding="utf-8"))
    order = metadata.get("order")
    return order if isinstance(order, int) else None


# ---------- Lessons ----------

def list_all_lessons(subject_slug, section_folder_name):
    """
    Every lesson in a section — both published and draft — for the
    admin UI. Returns dicts with slug, title, filename, order, and a
    'published' flag. Ordered by explicit "order" frontmatter when
    present (falling back to filename prefix, same as the public
    site), so the reorder UI reflects what visitors actually see.
    """
    section_dir = _content_root() / subject_slug / section_folder_name
    if not section_dir.is_dir():
        return []

    lessons = []
    for md_file in section_dir.glob("*.md"):
        lessons.append(_lesson_summary(md_file, published=True))

    drafts_dir = section_dir / ".drafts"
    if drafts_dir.is_dir():
        for md_file in drafts_dir.glob("*.md"):
            lessons.append(_lesson_summary(md_file, published=False))

    lessons.sort(key=lambda l: (l["order"] if l["order"] is not None else l["prefix"], l["filename"]))
    return lessons


def _lesson_summary(md_file, published):
    text = md_file.read_text(encoding="utf-8")
    title_match = re.search(r"^title:\s*(.+)$", text, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else md_file.stem
    order_match = re.search(r"^order:\s*(-?\d+)\s*$", text, re.MULTILINE)
    prefix_match = re.match(r"^(\d+)-", md_file.stem)
    return {
        "filename": md_file.name,
        "slug": _ORDER_PREFIX_PATTERN.sub("", md_file.stem),
        "title": title,
        "order": int(order_match.group(1)) if order_match else None,
        "prefix": int(prefix_match.group(1)) if prefix_match else 9999,
        "published": published,
    }


def read_lesson_raw(subject_slug, section_folder_name, filename):
    """Read a lesson's raw file (frontmatter + body) for editing, checking both locations."""
    section_dir = _content_root() / subject_slug / section_folder_name
    for candidate in (section_dir / filename, section_dir / ".drafts" / filename):
        if candidate.is_file():
            text = candidate.read_text(encoding="utf-8")
            match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", text, re.DOTALL)
            body = match.group(2) if match else text
            title_match = re.search(r"^title:\s*(.+)$", text, re.MULTILINE)
            title = title_match.group(1).strip() if title_match else ""
            return {"title": title, "body": body, "filename": filename}
    raise ContentValidationError("Lesson file not found.")


def create_lesson(subject_slug, section_folder_name, title, body):
    section_dir = _content_root() / subject_slug / section_folder_name
    if not section_dir.is_dir():
        raise ContentValidationError("Section not found.")

    base_slug = re.sub(r"[^a-z0-9]+", "-", title.strip().lower()).strip("-")
    _validate_slug(base_slug, "Lesson title")

    prefix = _next_prefix(section_dir, pattern="*.md")
    filename = f"{prefix}-{base_slug}.md"
    _write_lesson_file(section_dir / filename, title, body)
    return filename


def edit_lesson(subject_slug, section_folder_name, filename, title, body):
    section_dir = _content_root() / subject_slug / section_folder_name
    for candidate in (section_dir / filename, section_dir / ".drafts" / filename):
        if candidate.is_file():
            # Preserve any existing explicit "order" value — editing a
            # lesson's title/body should never silently reset its
            # position in the reorder sequence.
            existing_order = _read_lesson_order(candidate)
            _write_lesson_file(candidate, title, body, order=existing_order)
            return
    raise ContentValidationError("Lesson file not found.")


def _read_lesson_order(path):
    """Read a lesson file's current explicit order value, or None if it has none."""
    text = path.read_text(encoding="utf-8")
    match = re.search(r"^order:\s*(-?\d+)\s*$", text, re.MULTILINE)
    return int(match.group(1)) if match else None


def _write_lesson_file(path, title, body, order=None):
    frontmatter = f"title: {title.strip()}"
    if order is not None:
        frontmatter += f"\norder: {order}"
    content = f"---\n{frontmatter}\n---\n\n{body.strip()}\n"
    path.write_text(content, encoding="utf-8")


def delete_lesson(subject_slug, section_folder_name, filename):
    section_dir = _content_root() / subject_slug / section_folder_name
    for candidate in (section_dir / filename, section_dir / ".drafts" / filename):
        if candidate.is_file():
            candidate.unlink()
            return
    raise ContentValidationError("Lesson file not found.")


def is_lesson_published(subject_slug, section_folder_name, filename):
    """Check current publish state without changing it — lets a caller
    decide whether toggle_publish() actually needs to run."""
    section_dir = _content_root() / subject_slug / section_folder_name
    if (section_dir / filename).is_file():
        return True
    if (section_dir / ".drafts" / filename).is_file():
        return False
    raise ContentValidationError("Lesson file not found.")


def toggle_publish(subject_slug, section_folder_name, filename):
    """
    Move a lesson file between the section folder (published) and its
    .drafts subfolder (unpublished). Returns the new published state.
    """
    section_dir = _content_root() / subject_slug / section_folder_name
    published_path = section_dir / filename
    draft_path = section_dir / ".drafts" / filename

    if published_path.is_file():
        draft_path.parent.mkdir(exist_ok=True)
        published_path.rename(draft_path)
        return False

    if draft_path.is_file():
        draft_path.rename(published_path)
        return True

    raise ContentValidationError("Lesson file not found.")


# ---------- Explicit ordering (drag-and-drop UI persistence) ----------
#
# All three functions below share one pattern: the admin UI submits a
# full list of items in the exact sequence the admin dragged them
# into, and these functions assign order = 0, 1, 2, ... to match that
# sequence. Renumbering the whole list on every save (rather than
# trying to shuffle individual positions) avoids any edge case around
# running out of room between two adjacent numbers, and keeps the
# on-disk order values simple, small integers that are easy to read
# and hand-edit if ever needed.

def reorder_subjects(ordered_slugs):
    """Persist a new subject display order by writing order=0..N-1 into each subject.json."""
    root = _content_root()
    for index, slug in enumerate(ordered_slugs):
        subject_json = root / slug / "subject.json"
        if not subject_json.is_file():
            continue
        metadata = json.loads(subject_json.read_text(encoding="utf-8"))
        metadata["order"] = index
        subject_json.write_text(json.dumps(metadata, indent=4) + "\n", encoding="utf-8")


def reorder_sections(subject_slug, ordered_section_folders):
    """Persist a new section display order (within one subject) by writing order=0..N-1 into each section.json."""
    subject_dir = _content_root() / subject_slug
    for index, folder_name in enumerate(ordered_section_folders):
        section_json = subject_dir / folder_name / "section.json"
        if not section_json.is_file():
            continue
        metadata = json.loads(section_json.read_text(encoding="utf-8"))
        metadata["order"] = index
        section_json.write_text(json.dumps(metadata, indent=4) + "\n", encoding="utf-8")


def reorder_lessons(subject_slug, section_folder_name, ordered_filenames):
    """
    Persist a new lesson display order (within one section) by writing
    an order=0..N-1 frontmatter field into each lesson file — title
    and body are preserved exactly as they were, only the order value
    changes (or gets added, for a lesson that never had one before).
    """
    section_dir = _content_root() / subject_slug / section_folder_name
    for index, filename in enumerate(ordered_filenames):
        for candidate in (section_dir / filename, section_dir / ".drafts" / filename):
            if candidate.is_file():
                raw = read_lesson_raw(subject_slug, section_folder_name, filename)
                _write_lesson_file(candidate, raw["title"], raw["body"], order=index)
                break

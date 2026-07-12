"""
content_loader.py

Reads lesson content from the filesystem (content/) and converts it into
data the routes and templates can use. This is the only module in the
app that knows about the on-disk content layout — routes and templates
never touch the filesystem directly, so that layout can change later
without rippling through the rest of the codebase.
"""

import json
import re
from pathlib import Path

import markdown

from app.config import Config

# Matches a leading "---\n...frontmatter...\n---\n" block at the top of a
# lesson file. DOTALL lets '.' match newlines so the frontmatter body can
# span multiple lines.
_FRONTMATTER_PATTERN = re.compile(r"^---\s*\n(.*?)\n---\s*\n(.*)$", re.DOTALL)

# Strips a leading numeric ordering prefix like "01-" from a filename stem,
# so "01-variables.md" matches the URL slug "variables".
_ORDER_PREFIX_PATTERN = re.compile(r"^\d+-")


class LessonNotFoundError(Exception):
    """Raised when a requested subject or lesson doesn't exist on disk."""


def list_subjects():
    """
    Enumerate every subject present in content/, sorted alphabetically
    by folder name.

    A folder only counts as a subject if it contains a subject.json —
    this lets you stage a new subject folder without it appearing in
    navigation until it's actually ready.
    """
    content_root = Path(Config.CONTENT_DIR)
    subjects = []

    for subject_dir in sorted(content_root.iterdir()):
        if not subject_dir.is_dir():
            continue

        subject_json = subject_dir / "subject.json"
        if not subject_json.is_file():
            continue

        metadata = json.loads(subject_json.read_text(encoding="utf-8"))
        subjects.append({
            "slug": subject_dir.name,
            "title": metadata.get("title", subject_dir.name.title()),
        })

    return subjects


def _iter_section_dirs(subject_dir):
    """Yield a subject's section directories in filename-prefix order."""
    return sorted(d for d in subject_dir.iterdir() if d.is_dir())


def _iter_lesson_files(subject_dir):
    """
    Yield every lesson file in a subject as (slug, path) tuples, in
    filename-prefix order, flattened across all sections.

    This is the single place that walks the filesystem to enumerate
    lesson files — both build_subject_tree() and _find_lesson_file()
    use it, so there's exactly one definition of "what lesson files
    exist and in what order" for the module to maintain.
    """
    for section_dir in _iter_section_dirs(subject_dir):
        for lesson_file in sorted(section_dir.glob("*.md")):
            yield _ORDER_PREFIX_PATTERN.sub("", lesson_file.stem), lesson_file


def build_subject_tree(subject_slug):
    """
    Build the full section/lesson hierarchy for a subject: titles, slugs,
    and order. This is the single source of truth for "what lessons
    exist in this subject, and in what order" — used by both the
    sidebar and the Previous/Next navigation engine, so the two can
    never disagree about ordering.

    Returns None if the subject doesn't exist. Returns a tree with an
    empty "sections" list if the subject exists but has no lessons yet.
    """
    subject_dir = Path(Config.CONTENT_DIR) / subject_slug
    if not subject_dir.is_dir():
        return None

    subject_title = _read_json_title(
        subject_dir / "subject.json", fallback=subject_slug
    )

    sections = []
    for section_dir in _iter_section_dirs(subject_dir):
        lesson_files = sorted(section_dir.glob("*.md"))
        if not lesson_files:
            # A section folder with no lessons yet has nothing to order
            # or display, so it's skipped rather than shown empty.
            continue

        section_slug = _ORDER_PREFIX_PATTERN.sub("", section_dir.name)
        section_title = _read_json_title(
            section_dir / "section.json", fallback=section_slug
        )

        lessons = [
            {
                "slug": _ORDER_PREFIX_PATTERN.sub("", lesson_file.stem),
                "title": _read_lesson_title(lesson_file),
            }
            for lesson_file in lesson_files
        ]

        sections.append({
            "slug": section_slug,
            "title": section_title,
            "lessons": lessons,
        })

    return {"slug": subject_slug, "title": subject_title, "sections": sections}


def _read_json_title(json_path, fallback):
    """Read a "title" field from a subject.json/section.json file."""
    if not json_path.is_file():
        return fallback.replace("-", " ").title()
    metadata = json.loads(json_path.read_text(encoding="utf-8"))
    return metadata.get("title", fallback.replace("-", " ").title())


def _read_lesson_title(lesson_file):
    """
    Read just a lesson's title from its frontmatter, without converting
    the full Markdown body to HTML. The sidebar needs a title for every
    lesson in a subject, so fully rendering each one here (as load_lesson
    does for a single requested lesson) would be wasted work.
    """
    raw_text = lesson_file.read_text(encoding="utf-8")
    metadata, _ = _parse_frontmatter(raw_text)
    fallback_slug = _ORDER_PREFIX_PATTERN.sub("", lesson_file.stem)
    return metadata.get("title", fallback_slug.replace("-", " ").title())


def get_first_lesson_slug(subject_slug):
    """
    Find the slug of the first lesson in a subject, using the same
    ordered tree the sidebar renders from.

    Returns None if the subject doesn't exist or has no lessons yet.
    """
    tree = build_subject_tree(subject_slug)
    if not tree or not tree["sections"]:
        return None
    return tree["sections"][0]["lessons"][0]["slug"]


def load_lesson(subject_slug, lesson_slug):
    """
    Load a single lesson's title and rendered HTML body.

    Returns: {"title": str, "body_html": str}
    Raises: LessonNotFoundError if the subject folder or lesson file
    can't be found.
    """
    subject_dir = Path(Config.CONTENT_DIR) / subject_slug

    if not subject_dir.is_dir():
        raise LessonNotFoundError(f"Subject '{subject_slug}' does not exist")

    lesson_path = _find_lesson_file(subject_dir, lesson_slug)
    if lesson_path is None:
        raise LessonNotFoundError(
            f"Lesson '{lesson_slug}' not found in subject '{subject_slug}'"
        )

    raw_text = lesson_path.read_text(encoding="utf-8")
    metadata, body = _parse_frontmatter(raw_text)

    title = metadata.get("title", lesson_slug.replace("-", " ").title())
    body_html = markdown.markdown(body, extensions=["fenced_code", "tables"])

    return {"title": title, "body_html": body_html}


def _find_lesson_file(subject_dir, lesson_slug):
    """
    Locate a specific lesson's file by slug, reusing the same file
    iteration order as build_subject_tree() so there's one definition
    of "where lessons live," not two.
    """
    for slug, path in _iter_lesson_files(subject_dir):
        if slug == lesson_slug:
            return path
    return None


def _parse_frontmatter(raw_text):
    """
    Split a lesson file into its frontmatter metadata and Markdown body.

    Frontmatter is a flat "key: value" list, deliberately simple enough
    that it doesn't need a YAML dependency to parse.
    """
    match = _FRONTMATTER_PATTERN.match(raw_text)
    if not match:
        # No frontmatter block present — treat the whole file as the body.
        return {}, raw_text

    frontmatter_block, body = match.groups()
    metadata = {}
    for line in frontmatter_block.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        metadata[key.strip()] = value.strip()

    return metadata, body

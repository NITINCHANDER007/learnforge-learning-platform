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
from flask import url_for

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
    Enumerate every subject present in content/, in display order.

    Order comes from an explicit "order" field in subject.json when
    present (written by the admin reorder UI) — otherwise falls back
    to alphabetical by folder name, exactly as before. This means
    every subject created before the reorder feature existed keeps
    working with zero changes to its files.

    A folder only counts as a subject if it contains a subject.json —
    this lets you stage a new subject folder without it appearing in
    navigation until it's actually ready.
    """
    content_root = Path(Config.CONTENT_DIR)
    candidates = []

    for subject_dir in content_root.iterdir():
        if not subject_dir.is_dir():
            continue

        subject_json = subject_dir / "subject.json"
        if not subject_json.is_file():
            continue

        metadata = json.loads(subject_json.read_text(encoding="utf-8"))
        candidates.append({
            "slug": subject_dir.name,
            "title": metadata.get("title", subject_dir.name.title()),
            "order": _coerce_order(metadata.get("order")),
        })

    candidates.sort(key=lambda s: (s["order"] if s["order"] is not None else 9999, s["slug"]))

    # Strip the internal sort key before returning — callers have only
    # ever expected {"slug", "title"}.
    return [{"slug": s["slug"], "title": s["title"]} for s in candidates]


def _coerce_order(value):
    """
    Safely interpret a JSON/frontmatter "order" value as an int, or
    None if it's missing or not actually a number — so a typo'd order
    field degrades to "sort last" rather than crashing the page.
    """
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _iter_section_dirs(subject_dir):
    """
    Yield a subject's section directories in display order.

    Order comes from an explicit "order" field in each section's
    section.json when present (written by the admin reorder UI) —
    otherwise falls back to sorting by folder name, which is what
    numeric filename prefixes (e.g. "02-basics") have always driven.
    Existing sections with no "order" field keep their current
    position with zero changes needed.
    """
    def sort_key(section_dir):
        order = _read_json_order(section_dir / "section.json")
        return (order if order is not None else 9999, section_dir.name)

    return sorted(
        (d for d in subject_dir.iterdir() if d.is_dir() and not d.name.startswith(".")),
        key=sort_key,
    )


def _read_json_order(json_path):
    """Read an optional explicit "order" field from a subject.json/section.json file, or None if absent/invalid."""
    if not json_path.is_file():
        return None
    metadata = json.loads(json_path.read_text(encoding="utf-8"))
    return _coerce_order(metadata.get("order"))


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
        lesson_files = list(section_dir.glob("*.md"))
        if not lesson_files:
            # A section folder with no lessons yet has nothing to order
            # or display, so it's skipped rather than shown empty.
            continue

        section_slug = _ORDER_PREFIX_PATTERN.sub("", section_dir.name)
        section_title = _read_json_title(
            section_dir / "section.json", fallback=section_slug
        )

        # Order comes from an explicit "order:" frontmatter field when
        # present (written by the admin reorder UI) — otherwise falls
        # back to filename order, exactly as before.
        lesson_entries = []
        for lesson_file in lesson_files:
            title, order = _read_lesson_meta(lesson_file)
            lesson_entries.append({
                "slug": _ORDER_PREFIX_PATTERN.sub("", lesson_file.stem),
                "title": title,
                "_order": order,
                "_filename": lesson_file.name,
            })
        lesson_entries.sort(
            key=lambda l: (l["_order"] if l["_order"] is not None else 9999, l["_filename"])
        )
        lessons = [{"slug": l["slug"], "title": l["title"]} for l in lesson_entries]

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


def _read_lesson_meta(lesson_file):
    """
    Read a lesson's title and optional explicit order from its
    frontmatter, without converting the full Markdown body to HTML.
    The sidebar needs this for every lesson in a subject, so fully
    rendering each one here (as load_lesson does for a single
    requested lesson) would be wasted work.

    Returns (title, order) — order is None if the lesson has no
    explicit "order:" frontmatter field (the common case for content
    authored before the reorder feature existed).
    """
    raw_text = lesson_file.read_text(encoding="utf-8")
    metadata, _ = _parse_frontmatter(raw_text)
    fallback_slug = _ORDER_PREFIX_PATTERN.sub("", lesson_file.stem)
    title = metadata.get("title", fallback_slug.replace("-", " ").title())
    order = _coerce_order(metadata.get("order"))
    return title, order


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

    Relative image and download URLs in the Markdown source (e.g.
    "images/x.png" or "files/x.zip") are rewritten to point at the
    /content-media/ route, which serves them directly from content/.
    The Markdown renderer itself is not modified — the rewrite happens
    on the already-rendered HTML as a simple post-process step.
    """
    subject_dir = Path(Config.CONTENT_DIR) / subject_slug

    if not subject_dir.is_dir():
        raise LessonNotFoundError(f"Subject '{subject_slug}' does not exist")

    result = _find_lesson_file(subject_dir, lesson_slug)
    if result is None:
        raise LessonNotFoundError(
            f"Lesson '{lesson_slug}' not found in subject '{subject_slug}'"
        )

    lesson_path, section_folder = result
    raw_text = lesson_path.read_text(encoding="utf-8")
    metadata, body = _parse_frontmatter(raw_text)

    title = metadata.get("title", lesson_slug.replace("-", " ").title())
    body_html = markdown.markdown(body, extensions=["fenced_code", "tables"])
    body_html = _rewrite_media_urls(body_html, subject_slug, section_folder)

    return {"title": title, "body_html": body_html}


# Allow-listed extensions for the content-media route.
_ALLOWED_MEDIA_EXTENSIONS = frozenset([
    "png", "jpg", "jpeg", "gif", "svg", "webp",
    "mp4", "webm",
    "pdf", "zip", "txt",
])


def is_allowed_media_extension(filename):
    """Return True if the filename has a content-media-allowed extension."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in _ALLOWED_MEDIA_EXTENSIONS


# Matches src/href attributes in rendered HTML that look like relative
# media paths (images/, files/, videos/ prefix — never http/https//).
_RELATIVE_MEDIA_PATTERN = re.compile(
    r'(src|href)="((images|files|videos)/[^"]+)"'
)


def _rewrite_media_urls(html, subject_slug, section_folder):
    """
    Replace relative media URLs in rendered lesson HTML with absolute
    paths to the /content-media/ route.

    Only rewrites "images/...", "files/...", and "videos/..." prefixes
    — standard HTTP/HTTPS links and root-relative URLs are left alone.
    """
    def replace(match):
        attr = match.group(1)     # "src" or "href"
        rel_path = match.group(2) # e.g. "images/diagram.png"
        try:
            abs_url = url_for(
                "main.content_media",
                subject_slug=subject_slug,
                section_folder=section_folder,
                filepath=rel_path,
            )
        except RuntimeError:
            abs_url = f"/content-media/{subject_slug}/{section_folder}/{rel_path}"
        return f'{attr}="{abs_url}"'

    return _RELATIVE_MEDIA_PATTERN.sub(replace, html)


def _find_lesson_file(subject_dir, lesson_slug):
    """
    Locate a specific lesson's file by slug, reusing the same file
    iteration order as build_subject_tree() so there's one definition
    of "where lessons live," not two.

    Returns (Path, section_folder_name) or None if not found.
    The section_folder_name is needed by load_lesson() to construct
    the correct media URL for images/files in that section.
    """
    for slug, path, section_folder in _iter_lesson_files_with_section(subject_dir):
        if slug == lesson_slug:
            return path, section_folder
    return None


def _iter_lesson_files_with_section(subject_dir):
    """
    Like _iter_lesson_files, but also yields the section folder name
    so callers can construct section-relative URLs.
    """
    for section_dir in _iter_section_dirs(subject_dir):
        for lesson_file in sorted(section_dir.glob("*.md")):
            yield (
                _ORDER_PREFIX_PATTERN.sub("", lesson_file.stem),
                lesson_file,
                section_dir.name,
            )


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


def search_lessons(query):
    """
    Search lessons across all published subjects by title and Markdown content.
    Returns a list of dicts:
      [{"subject_slug": str, "subject_title": str, "lesson_slug": str, "lesson_title": str, "snippet": str}, ...]
    sorted by match relevance (title matches scored higher than body matches).
    """
    if not query or not query.strip():
        return []

    q_lower = query.strip().lower()
    terms = q_lower.split()
    results = []

    content_root = Path(Config.CONTENT_DIR)
    for subject in list_subjects():
        subject_slug = subject["slug"]
        subject_title = subject["title"]
        subject_dir = content_root / subject_slug
        if not subject_dir.is_dir():
            continue

        for slug, lesson_file, _ in _iter_lesson_files_with_section(subject_dir):
            try:
                raw_text = lesson_file.read_text(encoding="utf-8")
            except OSError:
                continue

            metadata, body = _parse_frontmatter(raw_text)
            title = metadata.get("title", slug.replace("-", " ").title())
            title_lower = title.lower()
            body_lower = body.lower()

            score = 0
            if q_lower in title_lower:
                score += 100
            if q_lower in body_lower:
                score += 20

            term_matches = sum(1 for t in terms if t in title_lower or t in body_lower)
            if term_matches == len(terms):
                score += 10
            elif term_matches > 0:
                score += term_matches

            if score > 0:
                idx = body_lower.find(terms[0]) if terms else -1
                if idx != -1:
                    start = max(0, idx - 40)
                    end = min(len(body), idx + 80)
                    snippet = body[start:end].replace("\n", " ").strip()
                    if start > 0:
                        snippet = "..." + snippet
                    if end < len(body):
                        snippet = snippet + "..."
                else:
                    snippet = body[:120].replace("\n", " ").strip() + "..."

                results.append({
                    "subject_slug": subject_slug,
                    "subject_title": subject_title,
                    "lesson_slug": slug,
                    "lesson_title": title,
                    "snippet": snippet,
                    "score": score,
                })

    results.sort(key=lambda r: r["score"], reverse=True)
    return results[:25]


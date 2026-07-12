# LearnForge

*Learn. Build. Master.*

A content-driven learning platform for programming, data science, and analytics — built with Flask, server-rendered Jinja templates, and zero JavaScript. Subjects, sections, and lessons are plain Markdown/JSON files on disk; the app discovers and orders everything automatically.

## Quick start

```bash
pip install -r requirements.txt
python run.py
```

Visit `http://127.0.0.1:5000` — the app redirects straight into the first lesson of the first subject it finds in `content/`.

## Adding content — no code changes required

This is the core design principle of the platform: **content is data, not code.**

```
content/
└── python/                        ← a subject
    ├── subject.json                 {"title": "Python"}
    └── 02-basics/                  ← a section (numeric prefix = order)
        ├── section.json              {"title": "Basics"}
        └── 01-variables.md         ← a lesson (numeric prefix = order)
```

A lesson file looks like:

```markdown
---
title: Variables
---

Your Markdown content here. Headings, code blocks, tables, blockquotes,
and lists are all styled automatically.
```

**To add a new subject:** create a new folder under `content/` with a `subject.json`. It appears in the top navigation automatically, sorted alphabetically alongside existing subjects.

**To add a section:** create a folder inside a subject with a `section.json` and a numeric prefix (`03-control-flow`) to control its position.

**To add a lesson:** drop a `.md` file into a section folder with a numeric prefix (`02-data-types.md`). The sidebar, Previous/Next navigation, and lesson count all update automatically — nothing else to touch.

**To reorder:** rename the numeric prefixes. **To unpublish:** remove the `subject.json`/`section.json` (the folder is then skipped, not shown as empty) or delete the lesson file.

## Architecture

```
app/
├── __init__.py           Flask app factory
├── config.py              Minimal app-wide settings
├── routes/main.py         3 routes: /, /<subject>, /<subject>/<lesson>
├── services/
│   ├── content_loader.py  Reads content/, builds the subject tree — the
│   │                      single source of truth for lesson order
│   └── nav_engine.py      Computes Previous/Next from that same tree
├── templates/             Jinja2 templates (base layout + components)
└── static/css/main.css    Design tokens + all styling (zero JS)
content/                   Your lessons, as Markdown + JSON — not code
```

**Why no database:** every page is derived live from `content/` on each request. This keeps the content model completely decoupled from the app — you can add, edit, or delete lessons with a text editor, no admin panel or migrations involved. See `content_loader.py` for the reasoning behind this trade-off at scale.

**Why no JavaScript:** collapsible sidebar sections use the native `<details>` element; the mobile navigation drawer uses a hidden-checkbox CSS pattern. Both are fully keyboard-accessible without a single line of JS.

## Tech stack & dependencies

| Dependency | Why |
|---|---|
| `Flask` | Web framework |
| `markdown` | Converts lesson `.md` files to HTML (no standard-library equivalent exists) |
| `gunicorn` | Production WSGI server — Flask's built-in dev server is explicitly not for production use |

Frontmatter parsing and content-tree building use only the Python standard library (`re`, `json`, `pathlib`) — no YAML or frontmatter package, since the format is a simple flat key/value list.

## Deploying to Render

1. Push this repository to GitHub.
2. In Render, create a new **Web Service** from the repo.
3. **Build command:** `pip install -r requirements.txt`
4. **Start command:** `gunicorn wsgi:app --bind 0.0.0.0:$PORT`
   (Render sets `$PORT` automatically; gunicorn reads it directly from the shell command, so no environment variable configuration is needed in the dashboard.)
5. No environment variables need to be set — see `.env.example` for why.

## Local development notes

- `run.py` runs the Flask dev server with debug mode and auto-reload — for local development only.
- `wsgi.py` is the production entry point (`gunicorn wsgi:app`), with debug mode off by default.
- There is intentionally no database, authentication, or admin panel in this version — see the "Adding content" section above for how content management works without one.

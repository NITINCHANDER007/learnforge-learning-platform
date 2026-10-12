# DataDrix

*Learn. Build. Master.*

An LMS-style learning platform inspired by the clarity of W3Schools, the depth of GitBook, and the structured roadmaps of Roadmap.sh.

DataDrix delivers a curated curriculum across 14 programming, data science, and analytics subjects with 166 lessons, designed for distraction-free reading, interactive student progress tracking, and complete admin content management.

---

## Highlights & Features

- **14 Subjects & 166 Lessons:** Complete curriculum for Python, SQL, HTML, CSS, JavaScript, Flask, Pandas, NumPy, Machine Learning, Data Visualization, Power BI, Excel, Web Scraping, and File Handling.
- **Markdown-First Architecture:** Educational content lives on disk in `content/` as Markdown (`.md`) and JSON files. Lessons are decoupled from database state and are discovered, parsed, and ordered automatically.
- **Fast, Server-Rendered UI:** Built with Flask 3 and Jinja2 with modern design tokens, zero heavy frontend framework overhead, and instant load times.
- **Keyboard-Accessible Live Search:** Press `/` or `Ctrl+K` from anywhere to trigger real-time search across titles and lesson contents, with arrow-key navigation and full `/search?q=...` results page.
- **Dark Mode:** Seamless dark/light theme toggle using CSS variables with persistent `localStorage` preference and early head bootstrapper to eliminate theme flash.
- **Student Dashboard:** Personal learning overview tracking completed lessons with visual checkmarks, one-click bookmarks, and personal markdown study notes with file attachments.
- **Strict Data Privacy:** Student note attachments (`/uploads/notes/<user_id>/...`) are private and owner-scoped; only the author or platform admins can access them.
- **Lesson Media Route:** Safe, read-only content media serving (`/content-media/<subject>/<section>/...`) with path-traversal protection, extension allow-listing, and automatic relative URL rewriting in rendered HTML.
- **Admin Control Suite:**
  - **User Management:** Search users, filter by role/status, edit profiles, promote/demote roles, view individual student progress histories, and toggle active/deactivated accounts.
  - **Lesson Management:** Markdown editor, block builder with privacy-friendly YouTube nocookie embeds (`youtube-nocookie.com`), draft vs. published states, duplicate lesson, and live preview with real renderer.
  - **Media Library:** Upload, browse, copy Markdown snippets, and manage images, videos, and files per section.
  - **Platform Analytics:** Daily lesson completions volume over the last 30 days, top 10 most completed lessons, and 7-day active user metrics.
  - **Visual Reordering:** Drag-and-drop or sequence reordering of subjects, sections, and lessons.
- **Security & Hardening:**
  - Secure session cookie configuration (`SESSION_COOKIE_HTTPONLY`, `SESSION_COOKIE_SAMESITE`, `SESSION_COOKIE_SECURE`).
  - Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`.
  - Rate limiting & 15-minute lockout on consecutive login failures.
  - Signed password reset tokens via `itsdangerous` with configurable SMTP/console fallback.
  - Custom branded 403, 404, and 500 error pages.
- **Test Suite:** Comprehensive `pytest` test suite with 26 automated unit and integration tests.
- **GitHub Actions CI:** Automated pipeline running multi-version Python linting, migration check, and pytest on push and pull requests.

---

## Tech Stack

| Component | Technology | Rationale |
|---|---|---|
| Framework | **Flask 3.0.3** | Lightweight, predictable server-side rendering |
| Content Parser | **markdown 3.7** | Converts lesson Markdown to styled HTML with tables and fenced code |
| ORM & Database | **Flask-SQLAlchemy 3.1.1** | User accounts, progress, bookmarks, and notes (SQLite / PostgreSQL) |
| Migrations | **Flask-Migrate 4.0.7** (Alembic) | Versioned database schema evolution |
| Authentication | **Flask-Login 0.6.3** | Session-based authentication with owner scoping |
| Form Security | **Flask-WTF 1.2.1** | CSRF protection on every state-changing POST form |
| Styling | **Vanilla CSS** | Token-based design system (`main.css`) with light/dark modes |
| Production Server | **Gunicorn 22.0.0** | Production-ready WSGI application server |
| Test Suite | **pytest 8.1.1** | Comprehensive testing covering all flows and boundaries |

---

## Directory Structure

```
learning-platform/
├── .github/workflows/ci.yml       GitHub Actions CI pipeline
├── app/
│   ├── admin/                     Admin routes, content manager, forms
│   ├── auth/                      Registration, login, lockout, password reset
│   ├── dashboard/                 Student dashboard (progress, bookmarks, notes)
│   ├── models/                    SQLAlchemy models (User, Progress, Bookmark, Note, LessonNote)
│   ├── routes/                    Main learning routes (home, subjects, lessons, search, static pages)
│   ├── services/
│   │   ├── content_loader.py      Content discovery, lesson parser, search, media rewriting
│   │   └── nav_engine.py          Previous/Next navigation boundary calculations
│   ├── static/                    CSS design tokens and vanilla JS modules
│   ├── templates/                 Jinja2 templates (base, admin, auth, dashboard, pages, errors)
│   ├── uploads/                   Upload storage handler and access-controlled file server
│   └── config.py                  Central configuration & production security flags
├── content/                       14 subjects, 166 lessons in Markdown + JSON
├── migrations/                    Alembic migration versions
├── tests/                         pytest suite covering all models, routes, and security boundaries
├── requirements.txt               Project dependencies
├── run.py                         Local development server runner
└── wsgi.py                        Production WSGI entry point
```

---

## Getting Started Locally

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.11, 3.12, and 3.14)
- Git

### 2. Installation

```bash
# Clone the repository
git clone <repo-url>
cd learning-platform

# Install dependencies
python -m pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

### 3. Database Migration & Initial Admin Setup

```bash
# Set Flask application entry point
export FLASK_APP=wsgi.py  # On Windows PowerShell: $env:FLASK_APP="wsgi.py"

# Apply Alembic migrations to initialize SQLite database
flask db upgrade

# Create the first administrator account
flask create-admin
# (Enter Admin Name, Email, and Password when prompted)
```

### 4. Running the Application

```bash
# Start local development server
python run.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser.

---

## Running the Test Suite

Run the full automated test suite using `pytest`:

```bash
pytest
```

To run with verbose output:
```bash
pytest -v
```

---

## Deploying to Render

Render is the primary cloud deployment target for DataDrix.

### 1. Create Services on Render
1. Connect your GitHub repository to [Render](https://render.com/).
2. Create a new **PostgreSQL** database instance (Free or Starter tier).
3. Create a new **Web Service** connected to your repository.

### 2. Web Service Configuration
- **Environment:** `Python`
- **Build Command:**
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command:**
  ```bash
  flask db upgrade && gunicorn wsgi:app --bind 0.0.0.0:$PORT
  ```

### 3. Environment Variables
Configure the following in the Render dashboard:
- `DATABASE_URL`: Automatically populated by Render when attaching PostgreSQL (automatically converted from `postgres://` to `postgresql://` by `config.py`).
- `SECRET_KEY`: A cryptographically secure random key. Generate one with:
  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```
- `FLASK_ENV`: `production`
- `UPLOAD_FOLDER`: `/var/data/uploads` (when using a Persistent Disk)

### 4. Persistent Disk Storage (Recommended for Production)
Render web service filesystems are ephemeral by default. For production deployments:
1. Under **Disks** in your Render service settings, add a Persistent Disk (e.g. Mount Path: `/var/data`, Size: 1 GB+).
2. Set `UPLOAD_FOLDER=/var/data/uploads` so student attachments and uploaded lesson media persist across redeploys.
3. For changes made to lesson Markdown files via the admin panel, commit changes back to git or symlink `content/` to persistent storage.

### 5. Seed First Admin on Render
Once the deployment finishes, open the Render **Shell** tab and run:
```bash
flask create-admin
```

---

## Verification & Quality Assurance

DataDrix enforces a strict verification standard:
1. **Clean Syntax:** Every Python file compiles without errors (`python -m compileall app/`).
2. **Templates Validated:** Balanced Jinja blocks across all public, dashboard, admin, and error templates.
3. **Styles Validated:** Cohesive design tokens, zero unstyled flash, full dark/light mode coverage.
4. **JavaScript Validated:** Passes node syntax checks (`node --check`) with zero external JS frameworks.
5. **RBAC Enforced:** All admin routes require `@admin_required`; student data routes require owner verification.
6. **Fresh Install Tested:** Migration sequence applies cleanly on blank SQLite and PostgreSQL databases.

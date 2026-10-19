# DataDrix (MERN Stack Platform)

*Learn. Build. Master.*

A full-stack LMS and developer practice platform built on the **MERN stack** (MongoDB, Express, React, Node.js) with Vite, offering interactive curriculum, hands-on practice, and algorithmic problem solving.

The web application runs on **Port 3000** (`http://localhost:3000`).

---

## Highlights & Features

- **Port 3000 First:** Accessible directly at `http://localhost:3000` in development and production.
- **14 Subjects & 166 Lessons:** Full curriculum for Python, SQL, HTML, CSS, JavaScript, Flask, Pandas, NumPy, Machine Learning, Data Visualization, Power BI, Excel, Web Scraping, and File Handling.
- **DataDrix Coding Practice Hub (`/practice`):**
  - Algorithmic challenges with difficulty filters (Basic, Easy, Medium, Hard) and company tags (Google, Amazon, Microsoft, Meta).
  - In-browser Code Runner with automated test case evaluation in Python (WebAssembly) and JavaScript.
  - Public sample cases, hidden edge cases, and runtime metrics in milliseconds.
  - Detailed solution editorials with $O(N)$ / $O(1)$ time and space complexity breakdowns.
- **DataDrix Technical Interview Preparation Corner (`/interview-prep`):**
  - Curated questions covering top tech companies and CS Core fundamentals (DBMS & SQL, Operating Systems, OOPs & SOLID, System Design, Python Internals).
  - Interactive answers, architectural diagrams, and personal "Mark as Mastered" readiness tracker.
- **Interactive Code Playground (`/playground`):** Client-side execution sandbox using Pyodide WebAssembly for Python and browser JavaScript.
- **Markdown Curriculum Engine:** Content is stored as clean Markdown (`.md`) files in `content/` with frontmatter and auto-discovered navigation.
- **JWT Authentication & Security:** Role-based access control (Student vs Administrator), bcryptjs password hashing, and token authentication.
- **Student Dashboard:** Track lesson completions, bookmarks, certificates, and private study notes.
- **Admin Control Center:** Manage users, author lessons, view platform analytics, and organize curriculum content.

---

## Tech Stack (MERN)

| Component | Technology | Rationale |
|---|---|---|
| **Frontend** | React 19 + Vite | Blazing fast client running on Port 3000 with instant HMR |
| **Backend API** | Node.js + Express 4 | High-throughput REST API with JWT authentication |
| **Database** | MongoDB + Mongoose 8 | Flexible document database for users, progress, notes |
| **Markdown Engine** | marked + marked-highlight | Converts lesson markdown into styled syntax-highlighted HTML |
| **Code Runner** | Pyodide WebAssembly | In-browser Python runtime with zero server execution overhead |
| **Styling** | Modern CSS Design Tokens | High-contrast light & dark modes with glassmorphism |

---

## Directory Structure

```
learning-platform/
├── client/                     React 19 + Vite Frontend (Runs on Port 3000)
│   ├── src/
│   │   ├── components/         Navbar, Footer, SearchModal, etc.
│   │   ├── context/            AuthContext, ThemeContext
│   │   ├── pages/              Practice, ProblemSolver, InterviewPrep, Lesson, etc.
│   │   └── services/           api.js client fetcher
│   └── vite.config.js          Vite configuration (Port: 3000)
├── server/                     Node.js + Express API Backend
│   ├── config/                 MongoDB connection
│   ├── middleware/             JWT auth, role protection, upload handler
│   ├── models/                 User, Progress, Bookmark, Note, LessonNote
│   ├── routes/                 auth, content, dashboard, admin
│   └── server.js               Express server entry point
├── content/                    14 subjects, 166 lessons in Markdown + JSON
├── uploads/                    Uploaded attachments and assets
├── package.json                Root orchestration scripts (concurrently dev runner)
└── render.yaml                 Node.js production deployment configuration
```

---

## Quick Start (Runs on Port 3000)

### 1. Install Dependencies

```bash
# Install root, backend, and frontend dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Configure Environment

Ensure `server/.env` is configured (or copy from `.env.example`):

```ini
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/datadrix
JWT_SECRET=datadrix-super-secret-jwt-key-2026-secure
CONTENT_DIR=../content
UPLOADS_DIR=../uploads
CLIENT_URL=http://localhost:3000
```

### 3. Run Development Server (Port 3000)

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

- **Frontend:** http://localhost:3000
- **Backend API:** Proxied through http://localhost:3000/api
- **Default Admin Account:** `admin@datadrix.com` / `adminpassword123`

---

### 4. Production Build & Start

```bash
# Build the React production bundle
npm run build

# Start the full-stack server on Port 3000
npm start
```

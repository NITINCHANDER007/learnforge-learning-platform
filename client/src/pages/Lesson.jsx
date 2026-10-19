import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle,
  Share2,
  FileText,
  Pin,
  Code2,
  Copy,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

export default function Lesson() {
  const { subjectSlug, lessonSlug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedLessonSlugs, setCompletedLessonSlugs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);

  // Personal Note state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);

  const contentRef = useRef(null);

  // Load lesson
  useEffect(() => {
    async function fetchLesson() {
      setLoading(true);
      setError(null);
      try {
        // If no lessonSlug is provided (e.g. visiting /python), fetch first lesson
        if (!lessonSlug) {
          const firstRes = await api.getFirstLesson(subjectSlug);
          if (firstRes.success && firstRes.firstLessonSlug) {
            navigate(`/${subjectSlug}/${firstRes.firstLessonSlug}`, { replace: true });
            return;
          }
        }

        const res = await api.getLesson(subjectSlug, lessonSlug);
        if (res.success) {
          setLessonData(res);
          setIsBookmarked(res.isBookmarked);
          setIsCompleted(res.isCompleted);
          setCompletedLessonSlugs(res.completedLessonSlugs || []);
          setNoteTitle(`Notes on: ${res.lesson.title}`);
        }
      } catch (err) {
        setError(err.message || 'Failed to load lesson');
      } finally {
        setLoading(false);
      }
    }

    if (subjectSlug) {
      fetchLesson();
    }
  }, [subjectSlug, lessonSlug]);

  // Attach interactive features (Copy Code / Try & Run Code) to rendered pre blocks
  useEffect(() => {
    if (!contentRef.current || !lessonData) return;

    const preElements = contentRef.current.querySelectorAll('pre');
    preElements.forEach((pre, idx) => {
      // Don't add buttons if already attached
      if (pre.querySelector('.code-actions-toolbar')) return;

      const codeEl = pre.querySelector('code');
      const rawCode = codeEl ? codeEl.innerText : pre.innerText;

      const toolbar = document.createElement('div');
      toolbar.className = 'code-actions-toolbar';

      // Copy Code button
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'code-action-btn';
      copyBtn.innerHTML = `<span>Copy</span>`;
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(rawCode);
        copyBtn.innerHTML = `<span style="color:#10b981;">Copied!</span>`;
        setTimeout(() => {
          copyBtn.innerHTML = `<span>Copy</span>`;
        }, 1500);
      };

      // Determine language with multi-tier detection
      // Note: Must NOT use .includes('js') because 'hljs' contains 'js' as a substring!
      const classes = ((codeEl?.className || '') + ' ' + (pre.className || '')).toLowerCase();
      const isCliOrPlaintext =
        /\blanguage-(bash|sh|shell|zsh|terminal|plaintext|text|output|console)\b/.test(classes) ||
        /^\s*(\$|>|npm |pip |pip3 |git |python -m |curl |node )\s*/m.test(rawCode);

      const detectLang = () => {
        // 1. Explicit syntax highlighter classes with word boundaries
        if (/\blanguage-(javascript|jsx|typescript|ts)\b/.test(classes) || /\b(language-js|lang-js|lang-javascript)\b/.test(classes)) {
          return 'javascript';
        }
        if (/\blanguage-(python|py)\b/.test(classes) || /\b(lang-py|lang-python)\b/.test(classes)) {
          return 'python';
        }

        // 2. Fall back to current Subject category
        const pythonSubjects = ['python', 'pandas', 'numpy', 'machine-learning', 'web-scraping', 'file-handling', 'flask'];
        if (pythonSubjects.includes(subjectSlug)) {
          return 'python';
        }
        if (subjectSlug === 'javascript') {
          return 'javascript';
        }

        // 3. Syntax heuristics
        const hasPythonSyntax = /^\s*(def\s+\w+|import\s+\w+|from\s+\w+\s+import|print\(|class\s+\w+.*:|elif\s+|if\s+__name__\s*==)/m.test(rawCode);
        const hasJsSyntax = /^\s*(const\s+\w+|let\s+\w+|var\s+\w+|console\.log|function\s+\w+|=>)/m.test(rawCode);

        if (hasPythonSyntax && !hasJsSyntax) return 'python';
        if (hasJsSyntax && !hasPythonSyntax) return 'javascript';

        return 'python';
      };

      const detectedLang = detectLang();

      // Only show Try & Run Code button for executable snippets (hide for bash / terminal output)
      if (!isCliOrPlaintext) {
        const runBtn = document.createElement('button');
        runBtn.type = 'button';
        runBtn.className = 'code-action-btn run-code-btn';
        runBtn.innerHTML = `<span>⚡ Try & Run Code</span>`;
        runBtn.title = `Execute in ${detectedLang === 'python' ? 'Python 3 (WebAssembly)' : 'JavaScript'} Engine`;
        runBtn.onclick = () => {
          navigate(`/playground?lang=${detectedLang}&code=${encodeURIComponent(rawCode)}&autorun=true`);
        };
        toolbar.appendChild(runBtn);
      }

      toolbar.appendChild(copyBtn);
      pre.appendChild(toolbar);
    });
  }, [lessonData, subjectSlug]);

  // Toggle Bookmark
  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.toggleBookmark(subjectSlug, lessonSlug);
      if (res.success) {
        setIsBookmarked(res.bookmarked);
      }
    } catch (e) {
      console.error('Bookmark error:', e);
    }
  };

  // Toggle Progress with Confetti
  const handleToggleProgress = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.toggleProgress(subjectSlug, lessonSlug);
      if (res.success) {
        setIsCompleted(res.completed);
        if (res.completed) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          setCompletedLessonSlugs(prev => [...prev, lessonSlug]);
        } else {
          setCompletedLessonSlugs(prev => prev.filter(s => s !== lessonSlug));
        }
      }
    } catch (e) {
      console.error('Progress error:', e);
    }
  };

  // Save Personal Note
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setNoteSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', noteTitle);
      formData.append('body', noteBody);

      const res = await api.createNote(formData);
      if (res.success) {
        setNoteSavedFeedback(true);
        setTimeout(() => setNoteSavedFeedback(false), 2000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setNoteSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="lesson-loading-container">
        <div className="spinner"></div>
        <p>Loading lesson curriculum...</p>
      </div>
    );
  }

  if (error || !lessonData) {
    return (
      <div className="lesson-error-container">
        <h2>Lesson Not Found</h2>
        <p>{error || "The lesson you requested doesn't exist."}</p>
        <Link to="/" className="btn btn-primary">Return Home</Link>
      </div>
    );
  }

  const { lesson, subjectTree, nav, officialNotes } = lessonData;

  // Calculate subject completion percentage
  let totalSubjectLessons = 0;
  for (const s of (subjectTree?.sections || [])) {
    totalSubjectLessons += (s.lessons || []).length;
  }
  const completedCount = completedLessonSlugs.length;
  const progressPercent = totalSubjectLessons > 0 ? Math.round((completedCount / totalSubjectLessons) * 100) : 0;

  return (
    <div className="lesson-page-layout">
      {/* Sidebar Toggle for Desktop / Mobile */}
      <button
        type="button"
        className="sidebar-floating-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? "Hide Curriculum Sidebar" : "Show Curriculum Sidebar"}
      >
        {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
      </button>

      {/* Curriculum Navigation Sidebar */}
      <aside className={`curriculum-sidebar glass-panel ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link to={`/${subjectSlug}`} className="sidebar-subject-title">
            <span className="sidebar-subject-icon">{subjectTree.icon}</span>
            <div className="sidebar-subject-meta">
              <h3>{subjectTree.title}</h3>
              <span>{completedCount} / {totalSubjectLessons} Completed</span>
            </div>
          </Link>

          {/* Progress bar */}
          <div className="sidebar-progress-bar-bg">
            <div className="sidebar-progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="sidebar-sections-list">
          {subjectTree.sections.map((section, sIdx) => (
            <div key={section.folder} className="sidebar-section">
              <div className="sidebar-section-header">
                <span className="section-idx">{sIdx + 1}.</span>
                <span className="section-name">{section.title}</span>
              </div>
              <div className="sidebar-lessons-group">
                {section.lessons.map((item) => {
                  const isActive = item.slug === lessonSlug;
                  const isDone = completedLessonSlugs.includes(item.slug);

                  return (
                    <Link
                      key={item.slug}
                      to={`/${subjectSlug}/${item.slug}`}
                      className={`sidebar-lesson-link ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                    >
                      <div className="lesson-status-icon">
                        {isDone ? (
                          <CheckCircle size={14} className="check-done" />
                        ) : (
                          <div className="check-empty"></div>
                        )}
                      </div>
                      <span className="lesson-link-text">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Lesson Content Area */}
      <main className="lesson-content-main">
        {/* Breadcrumb Navigation */}
        <div className="lesson-breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={`/${subjectSlug}`}>{subjectTree.title}</Link>
          <span>/</span>
          <span className="breadcrumb-current">{lesson.title}</span>
        </div>

        {/* Lesson Header & Action Bar */}
        <div className="lesson-header-area glass-panel">
          <div className="lesson-header-top">
            <div className="lesson-title-meta">
              <span className="section-tag">{lesson.sectionTitle}</span>
              <h1 className="lesson-main-title">{lesson.title}</h1>
            </div>

            <div className="lesson-actions-group">
              {/* Mark Complete Button */}
              <button
                type="button"
                className={`btn ${isCompleted ? 'btn-success-active' : 'btn-secondary'} btn-sm`}
                onClick={handleToggleProgress}
              >
                <CheckCircle size={16} />
                <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
              </button>

              {/* Bookmark Button */}
              <button
                type="button"
                className={`btn ${isBookmarked ? 'btn-bookmark-active' : 'btn-secondary'} btn-sm`}
                onClick={handleToggleBookmark}
                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Lesson'}
              >
                <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>

              {/* Notes Drawer Toggle */}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setNotesDrawerOpen(!notesDrawerOpen)}
                title="Lesson Notes"
              >
                <FileText size={16} />
                <span>Notes {officialNotes?.length > 0 && `(${officialNotes.length})`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pinned Official Notes Notice */}
        {officialNotes && officialNotes.length > 0 && (
          <div className="official-notes-banner glass-panel">
            <div className="banner-icon"><Pin size={18} /></div>
            <div className="banner-text">
              <strong>Instructor Note:</strong> {officialNotes[0].title}
              <button type="button" className="btn-inline" onClick={() => setNotesDrawerOpen(true)}>
                View Details →
              </button>
            </div>
          </div>
        )}

        {/* Lesson Prose Rendered Markdown */}
        <article className="lesson-article glass-panel">
          <div
            ref={contentRef}
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: lesson.bodyHtml }}
          />
        </article>

        {/* Bottom Pagination Controls */}
        <div className="lesson-footer-nav">
          {nav?.previous ? (
            <Link to={`/${subjectSlug}/${nav.previous.slug}`} className="nav-card prev-card glass-panel">
              <ChevronLeft size={20} className="nav-arrow" />
              <div className="nav-text">
                <span className="nav-direction">Previous Lesson</span>
                <span className="nav-title">{nav.previous.title}</span>
              </div>
            </Link>
          ) : (
            <div></div>
          )}

          {nav?.next ? (
            <Link to={`/${subjectSlug}/${nav.next.slug}`} className="nav-card next-card glass-panel">
              <div className="nav-text" style={{ textAlign: 'right' }}>
                <span className="nav-direction">Next Lesson</span>
                <span className="nav-title">{nav.next.title}</span>
              </div>
              <ChevronRight size={20} className="nav-arrow" />
            </Link>
          ) : (
            <Link to={`/dashboard/certificate/${subjectSlug}`} className="nav-card cert-card glass-panel">
              <div className="nav-text" style={{ textAlign: 'right' }}>
                <span className="nav-direction">Curriculum Finished!</span>
                <span className="nav-title">Claim Subject Certificate 🎓</span>
              </div>
              <Sparkles size={20} className="nav-arrow" />
            </Link>
          )}
        </div>
      </main>

      {/* Slide-over Notes Drawer */}
      {notesDrawerOpen && (
        <div className="notes-drawer-backdrop" onClick={() => setNotesDrawerOpen(false)}>
          <div className="notes-drawer glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Notes & Resources</h3>
              <button type="button" className="close-btn" onClick={() => setNotesDrawerOpen(false)}>×</button>
            </div>

            <div className="drawer-body">
              {/* Official Notes from Instructor */}
              {officialNotes && officialNotes.length > 0 && (
                <div className="drawer-section">
                  <h4 className="drawer-subtitle">
                    <Pin size={14} /> Official Instructor Notes
                  </h4>
                  {officialNotes.map(n => (
                    <div key={n._id} className="official-note-box">
                      <span className="official-note-title">{n.title}</span>
                      <p className="official-note-body">{n.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Personal Student Note */}
              <div className="drawer-section">
                <h4 className="drawer-subtitle">
                  <FileText size={14} /> My Lesson Notes
                </h4>
                {isAuthenticated ? (
                  <form onSubmit={handleSaveNote} className="personal-note-form">
                    <input
                      type="text"
                      className="form-input"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Note Title"
                      required
                    />
                    <textarea
                      className="form-textarea"
                      rows={6}
                      value={noteBody}
                      onChange={(e) => setNoteBody(e.target.value)}
                      placeholder="Write your notes, code snippets, or key takeaways..."
                    />
                    <div className="note-form-actions">
                      <button type="submit" className="btn btn-primary btn-sm" disabled={noteSaving}>
                        {noteSaving ? 'Saving...' : 'Save Note'}
                      </button>
                      {noteSavedFeedback && <span className="save-success">Saved to your notes!</span>}
                    </div>
                  </form>
                ) : (
                  <div className="auth-prompt-box">
                    <p>Sign in to save personal notes on this lesson.</p>
                    <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .lesson-page-layout {
          display: flex;
          max-width: 1520px;
          margin: 0 auto;
          width: 100%;
          min-height: calc(100vh - 68px);
          position: relative;
        }
        .sidebar-floating-toggle {
          position: fixed;
          bottom: 24px;
          left: 24px;
          z-index: 90;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 10px;
          border-radius: var(--radius-full);
          box-shadow: var(--shadow-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .curriculum-sidebar {
          width: 340px;
          flex-shrink: 0;
          height: calc(100vh - 68px);
          position: sticky;
          top: 68px;
          overflow-y: auto;
          border-right: 1px solid var(--border-color);
          border-radius: 0;
          background: var(--bg-secondary);
          display: flex;
          flex-direction: column;
          transition: transform 0.25s ease, width 0.25s ease;
          z-index: 40;
        }
        .curriculum-sidebar.closed {
          transform: translateX(-100%);
          width: 0;
          overflow: hidden;
          padding: 0;
          border: none;
        }
        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
        }
        .sidebar-subject-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .sidebar-subject-icon {
          font-size: 1.8rem;
        }
        .sidebar-subject-meta h3 {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .sidebar-subject-meta span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .sidebar-progress-bar-bg {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 3px;
          overflow: hidden;
        }
        .sidebar-progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #10b981);
          transition: width 0.3s ease;
        }
        .sidebar-sections-list {
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .sidebar-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 8px;
        }
        .sidebar-lessons-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 4px;
        }
        .sidebar-lesson-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: var(--radius-sm);
          font-size: 0.88rem;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .sidebar-lesson-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }
        .sidebar-lesson-link.active {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          font-weight: 600;
          border-left: 3px solid var(--accent-primary);
        }
        .lesson-status-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .check-done {
          color: var(--accent-success);
        }
        .check-empty {
          width: 12px;
          height: 12px;
          border: 1.5px solid var(--border-color);
          border-radius: 50%;
        }
        .lesson-content-main {
          flex: 1;
          padding: 32px 48px 80px;
          max-width: 1020px;
          margin: 0 auto;
          width: 100%;
        }
        .lesson-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 20px;
        }
        .breadcrumb-current {
          color: var(--text-primary);
          font-weight: 500;
        }
        .lesson-header-area {
          padding: 24px 28px;
          margin-bottom: 24px;
        }
        .lesson-header-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }
        .section-tag {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--accent-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .lesson-main-title {
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-top: 4px;
        }
        .lesson-actions-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .btn-success-active {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        .btn-bookmark-active {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.4);
        }
        .official-notes-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          margin-bottom: 24px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fde68a;
          font-size: 0.9rem;
        }
        .btn-inline {
          margin-left: 8px;
          color: #fbbf24;
          font-weight: 600;
          text-decoration: underline;
        }
        .lesson-article {
          padding: 40px;
          margin-bottom: 40px;
        }
        /* Code Block Actions Toolbar */
        .code-actions-toolbar {
          position: absolute;
          top: 10px;
          right: 12px;
          display: flex;
          gap: 6px;
          z-index: 10;
        }
        .code-action-btn {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .code-action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
        .run-code-btn {
          background: rgba(99, 102, 241, 0.25);
          color: #c7d2fe;
          border-color: rgba(99, 102, 241, 0.4);
        }
        .run-code-btn:hover {
          background: rgba(99, 102, 241, 0.45);
        }
        .lesson-footer-nav {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .nav-card {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
        }
        .nav-card:hover {
          border-color: var(--accent-primary);
          transform: translateY(-2px);
        }
        .next-card {
          justify-content: flex-end;
        }
        .cert-card {
          justify-content: flex-end;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(236, 72, 153, 0.15));
        }
        .nav-direction {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          display: block;
        }
        .nav-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        /* Notes Slide-over */
        .notes-drawer-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }
        .notes-drawer {
          width: 440px;
          height: 100%;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-color);
          border-radius: 0;
          padding: 24px;
          display: flex;
          flex-direction: column;
          animation: slideDrawer 0.2s ease-out;
        }
        @keyframes slideDrawer {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .close-btn {
          font-size: 1.6rem;
          color: var(--text-muted);
        }
        .drawer-body {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-top: 16px;
        }
        .drawer-subtitle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: var(--text-primary);
        }
        .official-note-box {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: 12px;
          border-radius: var(--radius-md);
          margin-bottom: 8px;
        }
        .official-note-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: #fbbf24;
          display: block;
          margin-bottom: 4px;
        }
        .official-note-body {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .personal-note-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .form-input, .form-textarea {
          width: 100%;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          color: var(--text-primary);
        }
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: var(--accent-primary);
        }
        .note-form-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .save-success {
          color: var(--accent-success);
          font-size: 0.85rem;
          font-weight: 500;
        }
        @media (max-width: 900px) {
          .lesson-content-main {
            padding: 20px;
          }
          .lesson-article {
            padding: 20px;
          }
          .lesson-footer-nav {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

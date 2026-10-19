import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Bookmark, Trash2, ArrowRight, BookOpen } from 'lucide-react';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const res = await api.getBookmarks();
        if (res.success) {
          setBookmarks(res.bookmarks);
        }
      } catch (e) {
        console.error('Failed to load bookmarks:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchBookmarks();
  }, []);

  const handleRemove = async (b) => {
    try {
      const res = await api.toggleBookmark(b.subjectSlug, b.lessonSlug);
      if (res.success) {
        setBookmarks(prev => prev.filter(item => item.id !== b.id));
      }
    } catch (e) {
      console.error('Failed to remove bookmark:', e);
    }
  };

  return (
    <div className="bookmarks-page">
      <div className="page-header glass-panel">
        <div className="header-title-group">
          <Bookmark size={24} className="bookmark-icon-accent" />
          <h1>Saved Bookmarks</h1>
          <span className="badge badge-primary">{bookmarks.length} Lessons</span>
        </div>
        <p className="header-sub">Quickly return to lessons you flagged for review or reference.</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading your saved lessons...</div>
      ) : bookmarks.length > 0 ? (
        <div className="bookmarks-grid">
          {bookmarks.map((b) => (
            <div key={b.id} className="bookmark-card glass-panel">
              <div className="card-top">
                <span className="subject-tag">
                  <BookOpen size={12} /> {b.subjectSlug.toUpperCase()}
                </span>
                <button
                  type="button"
                  className="trash-btn"
                  onClick={() => handleRemove(b)}
                  title="Remove Bookmark"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 className="lesson-title">{b.title}</h3>
              <span className="saved-date">Saved on {new Date(b.createdAt).toLocaleDateString()}</span>

              <div className="card-actions">
                <Link to={`/${b.subjectSlug}/${b.lessonSlug}`} className="btn btn-primary btn-sm">
                  <span>Open Lesson</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-panel">
          <Bookmark size={48} className="empty-icon" />
          <h3>No Bookmarked Lessons</h3>
          <p>Click the "Bookmark" button on any lesson to save it here for fast access.</p>
          <Link to="/" className="btn btn-secondary">Explore Subjects</Link>
        </div>
      )}

      <style>{`
        .bookmarks-page {
          max-width: 1360px;
          margin: 0 auto;
          padding: 40px 24px 80px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          width: 100%;
        }
        .page-header {
          padding: 32px;
        }
        .header-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .header-title-group h1 {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
        }
        .bookmark-icon-accent {
          color: #fbbf24;
        }
        .header-sub {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
        .bookmarks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .bookmark-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
        }
        .bookmark-card:hover {
          transform: translateY(-2px);
          border-color: var(--accent-primary);
        }
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .subject-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-secondary);
        }
        .trash-btn {
          color: var(--text-muted);
          padding: 4px;
          transition: color var(--transition-fast);
        }
        .trash-btn:hover {
          color: var(--accent-danger);
        }
        .lesson-title {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--text-primary);
        }
        .saved-date {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 20px;
        }
        .card-actions {
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }
        .empty-state {
          padding: 60px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .empty-icon {
          color: var(--text-muted);
          opacity: 0.5;
        }
        .empty-state h3 {
          font-family: var(--font-display);
          font-size: 1.4rem;
        }
        .empty-state p {
          color: var(--text-secondary);
          max-width: 440px;
        }
      `}</style>
    </div>
  );
}

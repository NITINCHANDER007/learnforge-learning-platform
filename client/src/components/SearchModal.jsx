import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, ArrowRight, CornerDownLeft } from 'lucide-react';
import { api } from '../services/api';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.searchLessons(query);
        if (res.success) {
          setResults(res.results);
          setSelectedIndex(0);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      const target = results[selectedIndex];
      navigate(target.url);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-backdrop" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <Search size={20} className="modal-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input-field"
            placeholder="Search 166 lessons across Python, SQL, ML, Web..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" className="clear-btn" onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="search-results-container">
          {loading ? (
            <div className="search-feedback">Searching content...</div>
          ) : results.length > 0 ? (
            <div className="search-results-list">
              {results.map((res, index) => (
                <div
                  key={`${res.subjectSlug}-${res.lessonSlug}-${index}`}
                  className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => {
                    navigate(res.url);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="result-main">
                    <span className="result-subject-badge">
                      <BookOpen size={12} /> {res.subjectTitle}
                    </span>
                    <h4 className="result-lesson-title">{res.lessonTitle}</h4>
                    <p className="result-snippet">{res.snippet}</p>
                  </div>
                  <CornerDownLeft size={16} className="jump-icon" />
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="search-feedback">No matching lessons found for "{query}".</div>
          ) : (
            <div className="search-hint-box">
              <span>Try searching for:</span>
              <div className="search-quick-tags">
                <button type="button" onClick={() => setQuery('pandas dataframe')}>pandas dataframe</button>
                <button type="button" onClick={() => setQuery('sql join')}>sql join</button>
                <button type="button" onClick={() => setQuery('machine learning regression')}>regression</button>
                <button type="button" onClick={() => setQuery('functions')}>functions</button>
              </div>
            </div>
          )}
        </div>

        <div className="search-footer">
          <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
          <span><kbd>↵</kbd> to select</span>
          <span><kbd>ESC</kbd> to dismiss</span>
        </div>
      </div>

      <style>{`
        .search-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 100px;
          z-index: 1000;
          animation: modalFade 0.15s ease-out;
        }
        @keyframes modalFade {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .search-modal {
          width: 90%;
          max-width: 650px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: #0d1322 !important;
          border: 1px solid rgba(255, 255, 255, 0.16) !important;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.08);
        }
        [data-theme='light'] .search-modal {
          background: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.12) !important;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
        }
        .search-input-wrapper {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          gap: 12px;
        }
        .modal-search-icon {
          color: var(--accent-primary);
        }
        .search-input-field {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 1.1rem;
        }
        .clear-btn {
          color: var(--text-muted);
          padding: 4px;
        }
        .search-results-container {
          max-height: 420px;
          overflow-y: auto;
          padding: 12px;
        }
        .search-feedback {
          padding: 32px 16px;
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
        .search-results-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .search-result-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          background: var(--bg-tertiary);
          cursor: pointer;
          transition: all var(--transition-fast);
          border: 1px solid transparent;
        }
        .search-result-item:hover, .search-result-item.selected {
          border-color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.12);
        }
        .result-main {
          flex: 1;
        }
        .result-subject-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          color: var(--accent-secondary);
          font-weight: 600;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .result-lesson-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .result-snippet {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .jump-icon {
          color: var(--accent-primary);
          opacity: 0.5;
        }
        .search-result-item.selected .jump-icon {
          opacity: 1;
        }
        .search-hint-box {
          padding: 24px;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .search-quick-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }
        .search-quick-tags button {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .search-quick-tags button:hover {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }
        .search-footer {
          padding: 10px 20px;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 16px;
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(0, 0, 0, 0.1);
        }
        .search-footer kbd {
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 5px;
          border-radius: 3px;
          font-family: var(--font-mono);
        }
      `}</style>
    </div>
  );
}

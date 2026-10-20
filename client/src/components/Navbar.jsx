import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  Search,
  Moon,
  Sun,
  Code2,
  BookOpen,
  ChevronDown,
  User,
  Bookmark,
  FileText,
  Shield,
  LogOut,
  Menu,
  X,
  Target,
  Terminal,
  Award,
  ArrowRight,
  Share2
} from 'lucide-react';

export const SUBJECT_CATEGORIES = [
  {
    id: 'trendy',
    label: '🔥 Trendy',
    title: 'Trendy Subjects',
    description: 'High-growth skills in Artificial Intelligence, Modern Analytics & Automation',
    badge: 'Trending'
  },
  {
    id: 'popular',
    label: '⭐ Popular',
    title: 'Popular Subjects',
    description: 'Most popular foundational tracks chosen by thousands of tech learners',
    badge: 'Popular'
  },
  {
    id: 'data-ai',
    label: '🤖 Data & AI',
    title: 'Data Science & AI',
    description: 'Data wrangling, business intelligence, and machine learning models',
    badge: 'Data & AI'
  },
  {
    id: 'web-dev',
    label: '🌐 Web & Dev',
    title: 'Web & Software Engineering',
    description: 'Modern frontend interfaces, backend APIs, and web scripting',
    badge: 'Web Dev'
  },
  {
    id: 'all',
    label: '📚 All (14)',
    title: 'All 14 Tech Paths',
    description: 'Complete curriculum catalog with live coding playgrounds',
    badge: 'All'
  }
];

export const SUBJECT_METADATA = {
  'machine-learning': { categories: ['trendy', 'data-ai'], badge: '🔥 Hot AI' },
  'python': { categories: ['trendy', 'popular', 'data-ai', 'web-dev'], badge: '⭐ Most Popular' },
  'pandas': { categories: ['trendy', 'data-ai'], badge: '🔥 Trending' },
  'data-visualization': { categories: ['trendy', 'data-ai'], badge: '🔥 In Demand' },
  'power-bi': { categories: ['trendy', 'data-ai'], badge: '🔥 High Growth' },
  'web-scraping': { categories: ['trendy', 'web-dev'], badge: 'Automation' },
  'sql': { categories: ['popular', 'data-ai'], badge: '⭐ Essential' },
  'javascript': { categories: ['popular', 'web-dev'], badge: '⭐ Core Web' },
  'html': { categories: ['popular', 'web-dev'], badge: 'Foundation' },
  'css': { categories: ['popular', 'web-dev'], badge: 'Design & UI' },
  'excel': { categories: ['popular', 'data-ai'], badge: '⭐ Top Pick' },
  'flask': { categories: ['web-dev'], badge: 'Backend' },
  'numpy': { categories: ['data-ai'], badge: 'Vectors & Math' },
  'file-handling': { categories: ['web-dev', 'popular'], badge: 'Core IO' }
};

export default function Navbar({ onOpenSearch }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [subjects, setSubjects] = useState([]);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('trendy');
  const [mobileCategory, setMobileCategory] = useState('trendy');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const subjectsRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await api.getSubjects();
        if (res.success) {
          setSubjects(res.subjects);
        }
      } catch (e) {
        console.error('Failed to load subjects:', e);
      }
    }
    fetchSubjects();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (subjectsRef.current && !subjectsRef.current.contains(e.target)) {
        setSubjectsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setSubjectsOpen(false);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Left: Brand & Main Navigation */}
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <span className="brand-logo-glow">⚡</span>
            <div className="brand-text">
              <span className="brand-title">LearnForge</span>
            </div>
          </Link>

          {/* Subjects Dropdown */}
          <div className="nav-dropdown" ref={subjectsRef}>
            <button
              type="button"
              className={`nav-link dropdown-toggle ${subjectsOpen ? 'active' : ''}`}
              onClick={() => setSubjectsOpen(!subjectsOpen)}
            >
              <BookOpen size={18} />
              <span>Subjects</span>
              <ChevronDown size={14} className={`caret ${subjectsOpen ? 'rotate' : ''}`} />
            </button>

            {subjectsOpen && (
              <div className="dropdown-menu subjects-menu">
                {/* Category Navigation Tabs */}
                <div className="subjects-cat-tabs">
                  {SUBJECT_CATEGORIES.map(cat => {
                    const count = cat.id === 'all'
                      ? subjects.length
                      : subjects.filter(s => SUBJECT_METADATA[s.slug]?.categories.includes(cat.id)).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        className={`cat-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCategory(cat.id);
                        }}
                      >
                        <span className="cat-tab-label">{cat.label}</span>
                        <span className="cat-count-pill">{count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Category Header Banner */}
                {(() => {
                  const currentCat = SUBJECT_CATEGORIES.find(c => c.id === activeCategory) || SUBJECT_CATEGORIES[0];
                  const displayed = activeCategory === 'all'
                    ? subjects
                    : subjects.filter(s => SUBJECT_METADATA[s.slug]?.categories.includes(activeCategory));

                  return (
                    <>
                      <div className="cat-info-banner">
                        <div className="cat-info-left">
                          <span className="cat-banner-title">{currentCat.title}</span>
                          <span className="cat-banner-desc">{currentCat.description}</span>
                        </div>
                        <span className="cat-total-badge">{displayed.length} tracks</span>
                      </div>

                      {/* Subjects Grid */}
                      <div className="subjects-grid-dropdown">
                        {displayed.map(s => {
                          const meta = SUBJECT_METADATA[s.slug] || {};
                          const badge = meta.badge;
                          return (
                            <Link
                              key={s.slug}
                              to={`/${s.slug}`}
                              className="subject-dropdown-item"
                              onClick={() => setSubjectsOpen(false)}
                            >
                              <div className="subject-icon-box">
                                <span className="subject-icon">{s.icon}</span>
                              </div>
                              <div className="subject-info">
                                <div className="subject-name-row">
                                  <span className="subject-name">{s.title}</span>
                                  {badge && (
                                    <span className={`subject-cat-badge ${
                                      activeCategory === 'trendy' || meta.categories?.includes('trendy')
                                        ? 'badge-trendy'
                                        : activeCategory === 'popular' || meta.categories?.includes('popular')
                                        ? 'badge-popular'
                                        : 'badge-default'
                                    }`}>
                                      {badge}
                                    </span>
                                  )}
                                </div>
                                <span className="subject-count">{s.lessonCount} interactive lessons</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}

                {/* Dropdown Footer */}
                <div className="subjects-dropdown-footer">
                  <div className="dropdown-footer-stats">
                    <span className="stats-dot"></span>
                    <span>166 interactive lessons across 14 tracks</span>
                  </div>
                  <div className="dropdown-footer-actions">
                    <Link
                      to="/practice"
                      className="dropdown-footer-link"
                      onClick={() => setSubjectsOpen(false)}
                    >
                      <span>Practice Lab</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Practice Hub Link */}
          <Link to="/practice" className={`nav-link ${location.pathname.startsWith('/practice') ? 'active' : ''}`}>
            <Terminal size={18} />
            <span>Practice</span>
          </Link>

          {/* Interview Corner Link */}
          <Link to="/interview-prep" className={`nav-link ${location.pathname === '/interview-prep' ? 'active' : ''}`}>
            <Target size={18} />
            <span>Interview Prep</span>
          </Link>

          {/* Playground Link */}
          <Link to="/playground" className={`nav-link ${location.pathname === '/playground' ? 'active' : ''}`}>
            <Code2 size={18} />
            <span>Playground</span>
          </Link>

          {/* Admin Panel Link - Strictly visible only to authenticated Administrators */}
          {isAdmin && (
            <>
              <Link
                to="/admin"
                className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                title="LearnForge Platform Administration Console"
              >
                <Shield size={17} />
                <span>Admin</span>
                <span className="badge-admin-tag">Staff</span>
              </Link>
              <Link
                to="/admin/seo-backlinks"
                className={`nav-link ${location.pathname === '/admin/seo-backlinks' ? 'active' : ''}`}
                title="Automated SEO Backlink Blog Engine & Multi-Platform Publisher"
              >
                <Share2 size={17} />
                <span>SEO Backlinks</span>
              </Link>
            </>
          )}
        </div>

        {/* Right: Search, Theme Toggle, Auth */}
        <div className="navbar-right">
          {/* Quick Search Button */}
          <button type="button" className="search-trigger" onClick={onOpenSearch}>
            <Search size={16} className="search-icon" />
            <span className="search-text">Search lessons...</span>
            <kbd className="search-shortcut">Ctrl K</kbd>
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            className="icon-button"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={19} className="theme-icon" /> : <Moon size={19} className="theme-icon" />}
          </button>

          {/* User Section */}
          {isAuthenticated ? (
            <div className="user-dropdown-container" ref={userRef}>
              <button
                type="button"
                className="user-profile-button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="avatar-circle">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name-display">{user.name}</span>
                <ChevronDown size={14} />
              </button>

              {userMenuOpen && (
                <div className="dropdown-menu user-menu">
                  <div className="user-menu-header">
                    <p className="user-menu-name">{user.name}</p>
                    <p className="user-menu-email">{user.email}</p>
                    <div className="user-menu-meta-row">
                      {isAdmin && <span className="badge badge-warning">Admin</span>}
                      <Link to="/dashboard" className="user-menu-progress-tag" onClick={() => setUserMenuOpen(false)}>
                        <Award size={12} color="#818cf8" />
                        <span>Account Progress</span>
                      </Link>
                    </div>
                  </div>
                  <div className="user-menu-links">
                    <Link to="/dashboard" className="user-menu-item">
                      <User size={16} /> Dashboard
                    </Link>
                    <Link to="/dashboard/bookmarks" className="user-menu-item">
                      <Bookmark size={16} /> Bookmarks
                    </Link>
                    <Link to="/dashboard/notes" className="user-menu-item">
                      <FileText size={16} /> Personal Notes
                    </Link>
                    {isAdmin && (
                      <>
                        <Link to="/admin" className="user-menu-item admin-link">
                          <Shield size={16} /> Admin Portal
                        </Link>
                        <Link to="/admin/seo-backlinks" className="user-menu-item">
                          <Share2 size={16} /> SEO Backlinks Engine
                        </Link>
                      </>
                    )}
                    <button
                      type="button"
                      className="user-menu-item logout-btn"
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                    >
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="icon-button mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu glass-panel">
          <Link to="/" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/playground" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
            ⚡ Interactive Playground
          </Link>
          <div className="mobile-section-header">
            <div className="mobile-section-title">Explore Subjects</div>
            <div className="mobile-cat-tabs">
              {SUBJECT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`mobile-cat-pill ${mobileCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setMobileCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mobile-subjects-list">
            {(mobileCategory === 'all'
              ? subjects
              : subjects.filter(s => SUBJECT_METADATA[s.slug]?.categories.includes(mobileCategory))
            ).map(s => {
              const meta = SUBJECT_METADATA[s.slug];
              return (
                <Link
                  key={s.slug}
                  to={`/${s.slug}`}
                  className="mobile-subject-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mobile-subject-title">{s.icon} {s.title}</span>
                  <div className="mobile-subject-tags">
                    {meta?.badge && <span className="mobile-badge-pill">{meta.badge}</span>}
                    <span className="badge badge-primary">{s.lessonCount}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mobile-auth-footer">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>
                  Student Dashboard
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>
                    Admin Portal
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="mobile-auth-row">
                <Link to="/login" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .navbar-container {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(8, 11, 18, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4), inset 0 -1px 0 rgba(255, 255, 255, 0.05);
          width: 100%;
        }
        [data-theme='light'] .navbar-container {
          background: rgba(255, 255, 255, 0.9);
        }
        .navbar-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 24px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .navbar-left, .navbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .brand-logo-glow {
          font-size: 1.8rem;
          filter: drop-shadow(0 0 12px rgba(99, 102, 241, 0.7));
          transition: transform 0.2s;
        }
        .navbar-brand:hover .brand-logo-glow {
          transform: scale(1.1) rotate(5deg);
        }
        .brand-title {
          font-family: var(--font-display);
          font-size: 1.45rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        [data-theme='light'] .brand-title {
          background: linear-gradient(135deg, #0f172a 35%, #4f46e5 100%) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
        }
        .brand-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
          margin-left: 6px;
          letter-spacing: 0.05em;
        }
        [data-theme='light'] .brand-badge {
          background: rgba(99, 102, 241, 0.12);
          color: #4338ca;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.94rem;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 8px 14px;
          border-radius: var(--radius-md);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-link:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-1px);
        }
        .nav-link.active {
          color: #fff;
          background: rgba(99, 102, 241, 0.18);
          border: 1px solid rgba(99, 102, 241, 0.35);
          box-shadow: 0 0 16px rgba(99, 102, 241, 0.25);
        }
        .badge-new {
          background: linear-gradient(135deg, #10b981, #06b6d4);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .badge-admin-tag {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.4);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          margin-left: 2px;
        }
        .nav-dropdown {
          position: relative;
        }
        .dropdown-toggle .caret {
          transition: transform 0.2s ease;
        }
        .dropdown-toggle .caret.rotate {
          transform: rotate(180deg);
        }
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          left: 0;
          min-width: 280px;
          padding: 16px;
          z-index: 9999;
          background: #0d1322 !important;
          border: 1px solid rgba(255, 255, 255, 0.16) !important;
          border-radius: var(--radius-lg);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
          animation: fadeIn 0.15s ease-out;
        }
        [data-theme='light'] .dropdown-menu {
          background: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.12) !important;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.18) !important;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .subjects-menu {
          width: 620px;
          max-width: calc(100vw - 32px);
          left: -40px;
          background: #0d1322 !important;
          padding: 16px 18px 12px;
        }
        .user-menu {
          background: #0d1322 !important;
        }
        [data-theme='light'] .subjects-menu,
        [data-theme='light'] .user-menu {
          background: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.12) !important;
        }
        [data-theme='light'] .subjects-menu {
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15) !important;
        }

        /* Subjects Category Navigation Tabs */
        .subjects-cat-tabs {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-color);
          scrollbar-width: none;
        }
        .subjects-cat-tabs::-webkit-scrollbar {
          display: none;
        }
        .cat-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }
        .cat-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }
        .cat-tab-btn.active {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(168, 85, 247, 0.35));
          border-color: rgba(129, 140, 248, 0.6);
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
        }
        [data-theme='light'] .cat-tab-btn {
          background: #f1f5f9;
          border-color: rgba(0, 0, 0, 0.08);
          color: #475569;
        }
        [data-theme='light'] .cat-tab-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        [data-theme='light'] .cat-tab-btn.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15));
          border-color: rgba(99, 102, 241, 0.45);
          color: #4338ca;
          box-shadow: 0 3px 12px rgba(99, 102, 241, 0.15);
        }
        .cat-count-pill {
          font-size: 0.68rem;
          padding: 1px 6px;
          border-radius: 9999px;
          background: rgba(0, 0, 0, 0.25);
          color: inherit;
          opacity: 0.9;
        }
        [data-theme='light'] .cat-count-pill {
          background: rgba(0, 0, 0, 0.06);
        }

        /* Category Info Banner */
        .cat-info-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          margin: 10px 0 12px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-md);
        }
        [data-theme='light'] .cat-info-banner {
          background: #f8fafc;
          border-color: rgba(0, 0, 0, 0.06);
        }
        .cat-info-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .cat-banner-title {
          font-family: var(--font-display);
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .cat-banner-desc {
          font-size: 0.74rem;
          color: var(--text-muted);
        }
        .cat-total-badge {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 9999px;
          background: rgba(99, 102, 241, 0.18);
          color: #c7d2fe;
          border: 1px solid rgba(99, 102, 241, 0.35);
          white-space: nowrap;
        }
        [data-theme='light'] .cat-total-badge {
          background: rgba(99, 102, 241, 0.1);
          color: #4338ca;
          border-color: rgba(99, 102, 241, 0.25);
        }

        /* Subjects Grid & Cards */
        .subjects-grid-dropdown {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 9px;
          max-height: 330px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .subjects-grid-dropdown::-webkit-scrollbar {
          width: 5px;
        }
        .subjects-grid-dropdown::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }
        [data-theme='light'] .subjects-grid-dropdown::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
        }
        .subject-dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all var(--transition-fast);
        }
        .subject-dropdown-item:hover {
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.4);
          transform: translateY(-1px);
        }
        [data-theme='light'] .subject-dropdown-item {
          background: #f8fafc !important;
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
          color: var(--text-primary) !important;
        }
        [data-theme='light'] .subject-dropdown-item:hover {
          background: #ffffff !important;
          border-color: rgba(99, 102, 241, 0.35) !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
        }
        .subject-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          flex-shrink: 0;
        }
        [data-theme='light'] .subject-icon-box {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .subject-info {
          flex: 1;
          min-width: 0;
        }
        .subject-name-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .subject-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .subject-count {
          font-size: 0.74rem;
          color: var(--text-muted);
          margin-top: 2px;
          display: block;
        }
        .subject-cat-badge {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 4px;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }
        .badge-trendy {
          background: rgba(249, 115, 22, 0.18);
          color: #fb923c;
          border: 1px solid rgba(249, 115, 22, 0.35);
        }
        [data-theme='light'] .badge-trendy {
          background: rgba(249, 115, 22, 0.12);
          color: #c2410c;
          border-color: rgba(249, 115, 22, 0.3);
        }
        .badge-popular {
          background: rgba(245, 158, 11, 0.18);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.35);
        }
        [data-theme='light'] .badge-popular {
          background: rgba(245, 158, 11, 0.12);
          color: #b45309;
          border-color: rgba(245, 158, 11, 0.3);
        }
        .badge-default {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }
        [data-theme='light'] .badge-default {
          background: rgba(99, 102, 241, 0.08);
          color: #4338ca;
          border-color: rgba(99, 102, 241, 0.25);
        }

        /* Subjects Dropdown Footer */
        .subjects-dropdown-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 4px 4px;
          margin-top: 10px;
          border-top: 1px solid var(--border-color);
          font-size: 0.78rem;
        }
        .dropdown-footer-stats {
          display: flex;
          align-items: center;
          gap: 7px;
          color: var(--text-muted);
        }
        .stats-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          display: inline-block;
        }
        .dropdown-footer-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--accent-primary);
          font-weight: 700;
          transition: gap 0.15s;
        }
        .dropdown-footer-link:hover {
          gap: 7px;
        }
        .search-trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: 7px 14px;
          border-radius: var(--radius-full);
          color: var(--text-muted);
          font-size: 0.85rem;
          transition: all var(--transition-fast);
        }
        .search-trigger:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }
        .search-shortcut {
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-family: var(--font-mono);
        }
        .icon-button {
          padding: 8px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .icon-button:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
        }
        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--gradient-brand);
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }
        .user-profile-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          border-radius: var(--radius-full);
          color: var(--text-primary);
          transition: background var(--transition-fast);
        }
        .user-profile-button:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        .user-dropdown-container {
          position: relative;
        }
        .user-menu {
          right: 0;
          left: auto;
          width: 220px;
        }
        .user-menu-header {
          padding: 8px 12px 12px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 6px;
        }
        .user-menu-name {
          font-weight: 600;
          font-size: 0.95rem;
        }
        .user-menu-email {
          font-size: 0.8rem;
          color: var(--text-muted);
          word-break: break-all;
        }
        .user-menu-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 6px;
          flex-wrap: wrap;
        }
        .user-menu-progress-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #a5b4fc;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          padding: 2px 7px;
          border-radius: var(--radius-sm);
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .user-menu-progress-tag:hover {
          background: rgba(99, 102, 241, 0.25);
          color: #fff;
        }
        .user-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          font-size: 0.9rem;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
          width: 100%;
          text-align: left;
        }
        .user-menu-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
        }
        .user-menu-item.logout-btn {
          color: var(--accent-danger);
        }
        .mobile-toggle {
          display: none;
        }
        @media (max-width: 900px) {
          .nav-dropdown, .search-trigger, .nav-link, .auth-buttons, .user-name-display {
            display: none;
          }
          .mobile-toggle {
            display: flex;
          }
        }
        .mobile-menu {
          position: fixed;
          top: 68px;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 20px;
          overflow-y: auto;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .mobile-link {
          font-size: 1.1rem;
          font-weight: 600;
          padding: 8px 0;
          border-bottom: 1px solid var(--border-color);
        }
        .mobile-section-header {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 10px;
        }
        .mobile-section-title {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .mobile-cat-tabs {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 6px;
          scrollbar-width: none;
        }
        .mobile-cat-tabs::-webkit-scrollbar {
          display: none;
        }
        .mobile-cat-pill {
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }
        .mobile-cat-pill.active {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
        }
        .mobile-subjects-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .mobile-subject-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          transition: all var(--transition-fast);
        }
        .mobile-subject-item:hover {
          border-color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.1);
        }
        .mobile-subject-title {
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mobile-subject-tags {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .mobile-badge-pill {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }
        [data-theme='light'] .mobile-badge-pill {
          background: rgba(99, 102, 241, 0.1);
          color: #4338ca;
        }
      `}</style>
    </header>
  );
}

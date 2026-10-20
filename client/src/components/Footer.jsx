import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand-column">
            <div className="footer-brand">
              <span className="brand-logo-glow">⚡</span>
              <span className="brand-title">LearnForge</span>
            </div>
            <p className="footer-tagline">
              Master programming, algorithms, data structures, and SQL with hands-on practice, virtual contests, and interview prep.
            </p>
          </div>

          <div className="footer-nav-column">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/playground">Interactive Playground</Link>
            <Link to="/practice">Coding Practice</Link>
            <Link to="/dashboard">Student Dashboard</Link>
            <Link to="/login">Sign In</Link>
          </div>

          <div className="footer-nav-column">
            <h4>Popular Subjects</h4>
            <Link to="/python">Python Programming</Link>
            <Link to="/sql">SQL & Relational Databases</Link>
            <Link to="/pandas">Pandas Data Analysis</Link>
            <Link to="/machine-learning">Machine Learning</Link>
          </div>

          <div className="footer-nav-column">
            <h4>Student Resources</h4>
            <Link to="/practice">Coding Arena & POTD</Link>
            <Link to="/interview-prep">Interview Hub & Guides</Link>
            <Link to="/playground">Interactive Code Runner</Link>
            <Link to="/dashboard">Bookmarks & Notes</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} LearnForge Platform. All rights reserved.</p>
          <div className="footer-bottom-links">
            <span>Free and open learning for students and developers worldwide.</span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-container {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          margin-top: auto;
          padding: 60px 0 24px;
        }
        .footer-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .footer-top {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.2fr;
          gap: 48px;
          padding-bottom: 40px;
          border-bottom: 1px solid var(--border-color);
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .footer-brand .brand-title {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 800;
          background: var(--gradient-brand);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .footer-tagline {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 18px;
          max-width: 360px;
        }
        .footer-nav-column h4 {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 16px;
        }
        .footer-nav-column a, .tech-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 10px;
          transition: color var(--transition-fast);
        }
        .footer-nav-column a:hover {
          color: var(--accent-primary);
        }
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 24px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        @media (max-width: 900px) {
          .footer-top {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
      `}</style>
    </footer>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Code2,
  ArrowRight,
  Flame,
  Award,
  CheckCircle2,
  Terminal,
  Zap,
  Layers,
  FileText,
  Trophy,
  Target,
  Bot,
  Play
} from 'lucide-react';
import { SUBJECT_CATEGORIES, SUBJECT_METADATA } from '../components/Navbar';

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('trendy');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getSubjects();
        if (res.success) {
          setSubjects(res.subjects);
        }

        if (isAuthenticated) {
          const dashRes = await api.getDashboardStats().catch(() => null);
          if (dashRes && dashRes.success) {
            setStats(dashRes.stats);
          }
        }
      } catch (e) {
        console.error('Home load error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAuthenticated]);

  const firstSubjectSlug = subjects.length > 0 ? subjects[0].slug : 'python';

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow"></div>
        <div className="hero-content">

          <div className="hero-grid">
            <div className="hero-inner">
              <div className="hero-badge">
                <span className="hero-badge-dot"></span>
                <span>14 Subjects · 166 Interactive Lessons · 100% Free</span>
              </div>

              <h1 className="hero-title">
                Master Programming. <br />
                <span className="text-gradient">One Lesson at a Time.</span>
              </h1>

              <p className="hero-subtitle">
                Fast, distraction-free curriculum covering Python, SQL, Machine Learning, Data Analytics, Web Development, and more. Built for how engineers actually learn.
              </p>

              <div className="hero-actions">
                {stats?.continueLearning ? (
                  <Link
                    to={`/${stats.continueLearning.subjectSlug}/${stats.continueLearning.lessonSlug}`}
                    className="btn btn-primary btn-lg"
                  >
                    <span>Continue: {stats.continueLearning.title}</span>
                    <ArrowRight size={18} />
                  </Link>
                ) : (
                  <Link to={`/${firstSubjectSlug}`} className="btn btn-primary btn-lg">
                    <span>Start Learning Free</span>
                    <ArrowRight size={18} />
                  </Link>
                )}

                <Link to="/playground" className="btn btn-secondary btn-lg">
                  <Code2 size={18} />
                  <span>Code Playground</span>
                </Link>

                <Link to="/practice" className="btn btn-primary btn-lg practice-hero-btn">
                  <Trophy size={18} color="#eab308" />
                  <span>Practice Arena</span>
                </Link>
              </div>
            </div>

            <div className="hero-preview">
              <div className="hero-code-window glass-panel">
                <div className="hero-code-window__header">
                  <div className="hero-code-window__dots">
                    <span className="dot dot--red"></span>
                    <span className="dot dot--yellow"></span>
                    <span className="dot dot--green"></span>
                  </div>
                  <span className="hero-code-window__title">learn.py — LearnForge Interactive Engine</span>
                  <Link to="/playground" className="hero-code-window__run-btn">
                    <Play size={11} fill="currentColor" /> Run Live
                  </Link>
                </div>
                <pre className="hero-code-window__body">
                  <code>
                    <span className="tok-comment"># Welcome to LearnForge</span>{'\n'}
                    <span className="tok-kw">from</span> learnforge <span className="tok-kw">import</span> curriculum{'\n\n'}
                    student = {"{"}"role": "Builder", "streak": 1{"}"}{'\n'}
                    paths = ["Python", "SQL", "Machine Learning"]{'\n\n'}
                    <span className="tok-kw">for</span> track <span className="tok-kw">in</span> paths:{'\n'}
                    {'    '}print(f"✨ Mastering {"{"}track{"}"} with hands-on code..."){'\n\n'}
                    print("🎓 100% verified mastery unlocked!")
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Quick Metrics Banner */}
          <div className="hero-stats-banner glass-panel">
            <div className="stat-card">
              <span className="stat-number">14</span>
              <span className="stat-label">Full Curriculums</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <span className="stat-number">166</span>
              <span className="stat-label">Interactive Lessons</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <span className="stat-number">Arena</span>
              <span className="stat-label">Live Contests & SDE Kits</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <span className="stat-number">Instant</span>
              <span className="stat-label">In-Browser Code Runner</span>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Grid Section */}
      <section className="subjects-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <h2 className="section-title">Explore Tech Disciplines</h2>
            <p className="section-desc">Choose a subject to embark on a guided hands-on learning roadmap.</p>
          </div>
          <div className="home-cat-tabs">
            {SUBJECT_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`home-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="subject-card-skeleton glass-panel"></div>
            ))}
          </div>
        ) : (
          <div className="subjects-grid">
            {(selectedCategory === 'all'
              ? subjects
              : subjects.filter(s => SUBJECT_METADATA[s.slug]?.categories.includes(selectedCategory))
            ).map((sub) => {
              const meta = SUBJECT_METADATA[sub.slug] || {};
              return (
                <Link
                  key={sub.slug}
                  to={`/${sub.slug}`}
                  className="subject-card glass-panel"
                >
                  <div className="card-top">
                    <span className="card-icon">{sub.icon}</span>
                    <div className="card-badges-row">
                      {meta.badge && (
                        <span className={`home-card-badge ${
                          selectedCategory === 'trendy' || meta.categories?.includes('trendy')
                            ? 'badge-trendy'
                            : 'badge-popular'
                        }`}>
                          {meta.badge}
                        </span>
                      )}
                      <span className="badge badge-primary">{sub.lessonCount} Lessons</span>
                    </div>
                  </div>
                  <h3 className="card-title">{sub.title}</h3>
                  <p className="card-desc">
                    {sub.description || `Master core principles and real-world techniques in ${sub.title}.`}
                  </p>
                  <div className="card-footer">
                    <span className="explore-text">Start Roadmap</span>
                    <ArrowRight size={16} className="arrow-icon" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Interactive Platform Highlights */}
      <section className="features-section">
        <div className="features-inner glass-panel">
          <div className="features-header">
            <h2 className="section-title">Engineered For Modern Learners</h2>
            <p className="section-desc">Everything you need to learn, practice, retain, and showcase your skills.</p>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Terminal size={24} />
              </div>
              <h3>Instant In-Browser Execution</h3>
              <p>Execute Python, JavaScript, and SQL code right in your browser with zero installation and fast feedback.</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper" style={{ color: '#eab308', background: 'rgba(234, 179, 8, 0.12)' }}>
                <Trophy size={24} />
              </div>
              <h3>Coding Arena & Contests</h3>
              <p>Simulate 90-minute Job-A-Thon contests with live dynamic leaderboards, penalty systems, and post-contest scorecards.</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper" style={{ color: '#06b6d4', background: 'rgba(6, 182, 212, 0.12)' }}>
                <Target size={24} />
              </div>
              <h3>Visualizer & DrixBot AI</h3>
              <p>Inspect pointer positions and array states step-by-step alongside automated Big-O complexity analysis and test case hunters.</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Flame size={24} />
              </div>
              <h3>Daily Streaks & Progress</h3>
              <p>Keep your momentum alive with daily streak tracking, lesson completion markers, and subject progress rings.</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <FileText size={24} />
              </div>
              <h3>Personal Notes & Attachments</h3>
              <p>Take private notes on lessons, attach files, bookmark essential topics, and backup all your data via JSON.</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Award size={24} />
              </div>
              <h3>Verifiable Certificates</h3>
              <p>Earn custom completion certificates with cryptographic verification IDs to share on LinkedIn or portfolios.</p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .practice-hero-btn {
          background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(16, 185, 129, 0.25)) !important;
          border: 1px solid rgba(234, 179, 8, 0.4) !important;
          color: #fef08a !important;
          box-shadow: 0 4px 20px rgba(234, 179, 8, 0.15) !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .practice-hero-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(234, 179, 8, 0.3) !important;
          border-color: rgba(234, 179, 8, 0.7) !important;
        }
        .home-page {
          display: flex;
          flex-direction: column;
          gap: 60px;
          padding-bottom: 80px;
        }
        .hero-section {
          position: relative;
          padding: 80px 24px 40px;
          text-align: center;
          overflow: hidden;
        }
        .hero-glow {
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 400px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, transparent 70%);
          filter: blur(50px);
          pointer-events: none;
          z-index: 0;
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 40px;
          align-items: center;
          width: 100%;
        }

        .hero-inner {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.28);
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #818cf8;
          margin-bottom: 20px;
        }

        .hero-badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
        }
        
        .hero-title {
          font-family: var(--font-display);
          font-size: 3.2rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 18px;
        }
        .text-gradient {
          background: var(--gradient-brand);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 600px;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .hero-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: flex-start;
        }

        /* Hero Code Window Preview */
        .hero-preview {
          perspective: 1000px;
          display: flex;
          justify-content: center;
        }

        .hero-code-window {
          width: 100%;
          max-width: 480px;
          background: #070a10;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 25px rgba(99, 102, 241, 0.18);
          text-align: left;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hero-code-window:hover {
          transform: translateY(-4px);
          box-shadow: 0 25px 50px -10px rgba(0, 0, 0, 0.65), 0 0 30px rgba(99, 102, 241, 0.28);
        }

        .hero-code-window__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: #0f1420;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .hero-code-window__dots {
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }
        .dot--red { background: #ef4444; }
        .dot--yellow { background: #f59e0b; }
        .dot--green { background: #10b981; }

        .hero-code-window__title {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
        }

        .hero-code-window__run-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          background: #3b82f6;
          color: #ffffff;
          text-decoration: none;
          transition: background 0.2s;
        }

        .hero-code-window__run-btn:hover {
          background: #2563eb;
        }

        .hero-code-window__body {
          margin: 0;
          padding: 16px 18px;
          background: #070a10;
          font-family: var(--font-mono);
          font-size: 12.5px;
          line-height: 1.65;
          color: #e2e8f0;
          overflow-x: auto;
        }

        .tok-comment { color: #64748b; font-style: italic; }
        .tok-kw { color: #818cf8; font-weight: 600; }
        .tok-str { color: #34d399; }
        .tok-fn { color: #38bdf8; }

        @media (max-width: 960px) {
          .hero-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .hero-inner {
            align-items: center;
            text-align: center;
          }
          .hero-actions {
            justify-content: center;
          }
          .hero-title {
            font-size: 2.5rem;
          }
        }
        .btn-lg {
          padding: 14px 28px;
          font-size: 1.05rem;
          border-radius: var(--radius-lg);
        }
        .hero-stats-banner {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 24px 36px;
          width: 100%;
          max-width: 820px;
          background: rgba(18, 24, 38, 0.5);
        }
        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .stat-number {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .stat-divider {
          width: 1px;
          height: 36px;
          background: var(--border-color);
        }
        .subjects-section {
          max-width: 1360px;
          margin: 0 auto;
          padding: 0 24px;
          width: 100%;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .home-cat-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .home-cat-btn {
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .home-cat-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(99, 102, 241, 0.35);
        }
        .home-cat-btn.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3));
          color: white;
          border-color: rgba(129, 140, 248, 0.6);
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
        }
        [data-theme='light'] .home-cat-btn {
          background: #f1f5f9;
          border-color: rgba(0, 0, 0, 0.08);
          color: #475569;
        }
        [data-theme='light'] .home-cat-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        [data-theme='light'] .home-cat-btn.active {
          background: rgba(99, 102, 241, 0.12);
          border-color: rgba(99, 102, 241, 0.4);
          color: #4338ca;
        }
        .card-badges-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .home-card-badge {
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 4px;
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
        .section-title {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .section-desc {
          color: var(--text-secondary);
          font-size: 1rem;
          margin-top: 6px;
        }
        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .subject-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: var(--radius-lg);
          transition: all var(--transition-normal);
        }
        .subject-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
          border-color: var(--accent-primary);
        }
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .card-icon {
          font-size: 2.2rem;
        }
        .card-title {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--text-primary);
        }
        .card-desc {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 24px;
          flex-grow: 1;
        }
        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid var(--border-color);
          color: var(--accent-primary);
          font-weight: 600;
          font-size: 0.9rem;
        }
        .subject-card:hover .arrow-icon {
          transform: translateX(4px);
          transition: transform var(--transition-fast);
        }
        .features-section {
          max-width: 1360px;
          margin: 40px auto 0;
          padding: 0 24px;
          width: 100%;
        }
        .features-inner {
          padding: 48px;
        }
        .features-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 36px;
        }
        .feature-item {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .feature-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .feature-item h3 {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
        }
        .feature-item p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.6;
        }
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.3rem;
          }
          .hero-stats-banner {
            flex-direction: column;
            gap: 16px;
          }
          .stat-divider {
            display: none;
          }
          .features-inner {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}

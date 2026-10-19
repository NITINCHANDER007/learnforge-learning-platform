import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  CheckCircle2,
  Bookmark,
  FileText,
  Award,
  ArrowRight,
  Download,
  Upload,
  User,
  Key,
  Calendar,
  Sparkles,
  TrendingUp,
  Layers
} from 'lucide-react';

export default function Dashboard() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile modal / edit state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, profile

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getDashboardStats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (e) {
        console.error('Failed to load dashboard:', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Export JSON backup
  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('datadrix_token');
      const response = await fetch('/api/dashboard/export', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `datadrix-backup-${Date.now()}.json`;
      a.click();
    } catch (e) {
      alert('Export failed: ' + e.message);
    }
  };

  // Import JSON backup
  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const payload = JSON.parse(evt.target.result);
        const res = await api.importData(payload);
        if (res.success) {
          alert(res.message);
          window.location.reload();
        }
      } catch (err) {
        alert('Invalid JSON backup file or import error: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      const res = await api.updateProfile({ name: profileName, email: profileEmail });
      if (res.success) {
        updateProfile(res.user);
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message });
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your learning analytics...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header Welcome Banner */}
      <div className="dashboard-header glass-panel">
        <div className="user-info-section">
          <div className="dashboard-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-details">
            <div className="user-title-row">
              <h1>Welcome back, {user?.name}!</h1>
              {user?.role === 'admin' && <span className="badge badge-warning">Administrator</span>}
            </div>
            <p className="user-subtext">Track your progress, manage bookmarks, and collect certificates.</p>

            {/* User Account Overall Learning Progress Bar */}
            <div className="account-progress-banner">
              <div className="progress-banner-info">
                <div className="progress-banner-title">
                  <Award size={15} className="progress-award-icon" />
                  <span>Curriculum Completion</span>
                </div>
                <div className="progress-banner-stats">
                  <span className="progress-count-highlight">
                    <strong>{stats?.completedCount || 0}</strong> / {stats?.totalLessons || 166} Lessons
                  </span>
                  <span className="progress-percent-badge">
                    {stats?.overallPercent != null ? stats.overallPercent : Math.round(((stats?.completedCount || 0) / (stats?.totalLessons || 166)) * 100)}% Complete
                  </span>
                </div>
              </div>
              <div className="progress-track-large">
                <div
                  className="progress-fill-animated"
                  style={{
                    width: `${stats?.overallPercent != null ? stats.overallPercent : Math.round(((stats?.completedCount || 0) / (stats?.totalLessons || 166)) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-header-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Learning Analytics
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Account & Backup
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="dashboard-body">
          {/* Key Metrics Row */}
          <div className="metrics-grid">
            <div className="metric-card glass-panel streak-card">
              <div className="metric-icon-wrap streak-icon">
                <Flame size={24} />
              </div>
              <div className="metric-data">
                <span className="metric-number">{stats?.streak || 0} Days</span>
                <span className="metric-label">Daily Study Streak</span>
              </div>
            </div>

            <div className="metric-card glass-panel">
              <div className="metric-icon-wrap comp-icon">
                <CheckCircle2 size={24} />
              </div>
              <div className="metric-data">
                <span className="metric-number">{stats?.completedCount || 0}</span>
                <span className="metric-label">Completed Lessons</span>
              </div>
            </div>

            <Link to="/dashboard/bookmarks" className="metric-card glass-panel clickable">
              <div className="metric-icon-wrap bookmark-icon">
                <Bookmark size={24} />
              </div>
              <div className="metric-data">
                <span className="metric-number">{stats?.bookmarkCount || 0}</span>
                <span className="metric-label">Saved Bookmarks</span>
              </div>
            </Link>

            <Link to="/dashboard/notes" className="metric-card glass-panel clickable">
              <div className="metric-icon-wrap note-icon">
                <FileText size={24} />
              </div>
              <div className="metric-data">
                <span className="metric-number">{stats?.noteCount || 0}</span>
                <span className="metric-label">Personal Notes</span>
              </div>
            </Link>
          </div>

          {/* Continue Learning Widget */}
          {stats?.continueLearning && (
            <div className="continue-learning-card glass-panel">
              <div className="continue-left">
                <span className="continue-tag">
                  <Sparkles size={14} /> Recommended Next Step
                </span>
                <h3>{stats.continueLearning.title}</h3>
                <span className="continue-sub">{stats.continueLearning.subjectTitle} Curriculum</span>
              </div>
              <Link
                to={`/${stats.continueLearning.subjectSlug}/${stats.continueLearning.lessonSlug}`}
                className="btn btn-primary"
              >
                <span>Jump to Lesson</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* Two-Column: Subject Progress & Recent Activity */}
          <div className="dashboard-two-col">
            {/* Subject Progress Rings / Bars */}
            <div className="subject-progress-box glass-panel">
              <div className="box-header">
                <h3>Curriculum Progress</h3>
                <span className="badge badge-primary">{stats?.progressChart?.length || 0} Active Tracks</span>
              </div>

              {stats?.progressChart && stats.progressChart.length > 0 ? (
                <div className="progress-bars-list">
                  {stats.progressChart.map((item) => (
                    <div key={item.slug} className="subject-progress-item">
                      <div className="subject-bar-top">
                        <span className="subject-bar-title">
                          {item.icon} {item.title}
                        </span>
                        <div className="subject-bar-nums">
                          <span>{item.completed} / {item.total}</span>
                          <span className="percent-tag">{item.percent}%</span>
                        </div>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${item.percent}%` }}></div>
                      </div>

                      {/* Certificate Claim Button if 100% or started */}
                      <div className="subject-actions-row">
                        <Link to={`/${item.slug}`} className="sub-link">
                          Continue Track →
                        </Link>
                        {item.percent > 0 && (
                          <Link to={`/dashboard/certificate/${item.slug}`} className="cert-link">
                            <Award size={14} /> Certificate
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-box">
                  <p>You haven't completed any lessons yet.</p>
                  <Link to="/python" className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
                    Start with Python
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Activity Feed */}
            <div className="recent-activity-box glass-panel">
              <div className="box-header">
                <h3>Recent Activity</h3>
                <Calendar size={18} className="muted-icon" />
              </div>

              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="activity-timeline">
                  {stats.recentActivity.map((act, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        {act.type === 'completed' && (
                          <p>
                            Completed lesson:{' '}
                            <Link to={`/${act.subjectSlug}/${act.lessonSlug}`} className="activity-link">
                              {act.title}
                            </Link>
                          </p>
                        )}
                        {act.type === 'bookmarked' && (
                          <p>
                            Bookmarked lesson:{' '}
                            <Link to={`/${act.subjectSlug}/${act.lessonSlug}`} className="activity-link">
                              {act.title}
                            </Link>
                          </p>
                        )}
                        {act.type === 'note' && <p>Added private note: <strong>{act.title}</strong></p>}
                        <span className="activity-time">{new Date(act.at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-box">
                  <p>No recent activity yet. Start exploring lessons!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Account & Backup Tab */
        <div className="dashboard-account-grid">
          {/* Account Learning Progress Overview Card */}
          <div className="account-card glass-panel account-progress-overview-card">
            <div className="account-card-header-row">
              <div className="overview-title-group">
                <Award size={22} className="overview-icon" color="#818cf8" />
                <div>
                  <h3>Account Learning Progress</h3>
                  <p className="overview-desc">Your verified course completion and curriculum milestones.</p>
                </div>
              </div>
              <span className="badge badge-primary">
                {stats?.overallPercent != null ? stats.overallPercent : 0}% Complete
              </span>
            </div>

            <div className="account-progress-detail-box">
              <div className="account-progress-bar-wrap">
                <div
                  className="account-progress-bar-fill"
                  style={{ width: `${stats?.overallPercent != null ? stats.overallPercent : 0}%` }}
                />
              </div>
              <div className="account-stats-row">
                <div className="stat-item">
                  <span className="stat-label">Lessons Completed</span>
                  <span className="stat-val"><strong>{stats?.completedCount || 0}</strong> / {stats?.totalLessons || 166}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Active Tracks</span>
                  <span className="stat-val">{stats?.progressChart?.length || 0} Tracks</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Daily Study Streak</span>
                  <span className="stat-val">{stats?.streak || 0} Days</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Learner Rank</span>
                  <span className="stat-val" style={{ color: '#34d399' }}>
                    {(stats?.overallPercent || 0) >= 80 ? 'Master' : (stats?.overallPercent || 0) >= 40 ? 'Specialist' : (stats?.overallPercent || 0) > 0 ? 'Active Learner' : 'Getting Started'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="account-card glass-panel">
            <h3>Profile Settings</h3>
            {profileMsg && (
              <div className={`alert-box ${profileMsg.type}`}>{profileMsg.text}</div>
            )}
            <form onSubmit={handleUpdateProfile} className="account-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Update Profile</button>
            </form>
          </div>

          {/* Password Change Form */}
          <div className="account-card glass-panel">
            <h3>Change Password</h3>
            {passwordMsg && (
              <div className={`alert-box ${passwordMsg.type}`}>{passwordMsg.text}</div>
            )}
            <form onSubmit={handleChangePassword} className="account-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password (min 6 characters)</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-secondary btn-sm">Update Password</button>
            </form>
          </div>

          {/* Backup & Data Ownership */}
          <div className="account-card glass-panel backup-card">
            <h3>Data Archiving & Portability</h3>
            <p className="backup-desc">
              Download all your progress, bookmarks, and private notes as an archival JSON file, or restore data.
            </p>
            <div className="backup-actions">
              <button type="button" className="btn btn-primary btn-sm" onClick={handleExportData}>
                <Download size={16} /> Export Data (JSON)
              </button>
              <label className="btn btn-secondary btn-sm file-upload-btn">
                <Upload size={16} /> Restore Backup (JSON)
                <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-container {
          max-width: 1360px;
          margin: 0 auto;
          padding: 40px 24px 80px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          width: 100%;
        }
        .dashboard-header {
          padding: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
        }
        .user-info-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .dashboard-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--gradient-brand);
          color: white;
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-glow);
        }
        .user-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-title-row h1 {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
        }
        .user-subtext {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-top: 4px;
        }
        .account-progress-banner {
          margin-top: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          max-width: 520px;
        }
        .progress-banner-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 0.85rem;
        }
        .progress-banner-title {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-primary);
          font-weight: 600;
        }
        .progress-award-icon {
          color: #818cf8;
        }
        .progress-banner-stats {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .progress-count-highlight {
          color: var(--text-secondary);
          font-size: 0.82rem;
        }
        .progress-count-highlight strong {
          color: #818cf8;
        }
        .progress-percent-badge {
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.35);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 9999px;
        }
        .progress-track-large {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          overflow: hidden;
          position: relative;
        }
        .progress-fill-animated {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4);
          border-radius: 9999px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.5);
        }
        .account-progress-overview-card {
          grid-column: 1 / -1;
        }
        .account-card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .overview-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .overview-title-group h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .overview-desc {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }
        .account-progress-detail-box {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .account-progress-bar-wrap {
          width: 100%;
          height: 12px;
          background: rgba(255, 255, 255, 0.07);
          border-radius: 9999px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .account-progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #6366f1, #10b981);
          border-radius: 9999px;
          transition: width 0.8s ease;
          box-shadow: 0 0 14px rgba(99, 102, 241, 0.6);
        }
        .account-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
          padding: 16px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .stat-item .stat-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .stat-item .stat-val {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .dashboard-header-tabs {
          display: flex;
          gap: 8px;
          background: var(--bg-tertiary);
          padding: 6px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
        }
        .tab-btn {
          padding: 8px 18px;
          border-radius: var(--radius-full);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .tab-btn.active {
          background: var(--accent-primary);
          color: white;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }
        .metric-card {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .metric-card.clickable:hover {
          transform: translateY(-2px);
          border-color: var(--accent-primary);
        }
        .metric-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .streak-icon { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .comp-icon { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .bookmark-icon { background: rgba(99, 102, 241, 0.15); color: #6366f1; }
        .note-icon { background: rgba(6, 182, 212, 0.15); color: #06b6d4; }
        .metric-number {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 800;
          display: block;
        }
        .metric-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .continue-learning-card {
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(16, 185, 129, 0.08));
          border-color: rgba(99, 102, 241, 0.3);
        }
        .continue-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-primary);
          text-transform: uppercase;
        }
        .continue-left h3 {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 700;
          margin: 4px 0;
        }
        .continue-sub {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .dashboard-two-col {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
        }
        .subject-progress-box, .recent-activity-box {
          padding: 28px;
        }
        .box-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .box-header h3 {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 700;
        }
        .progress-bars-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .subject-bar-top {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .subject-bar-nums {
          display: flex;
          gap: 10px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .percent-tag {
          color: var(--accent-primary);
          font-weight: 700;
        }
        .bar-track {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #06b6d4);
          transition: width 0.4s ease;
        }
        .subject-actions-row {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
          font-size: 0.8rem;
        }
        .sub-link {
          color: var(--text-secondary);
        }
        .sub-link:hover {
          color: var(--accent-primary);
        }
        .cert-link {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #fbbf24;
          font-weight: 600;
        }
        .activity-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .timeline-item {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }
        .timeline-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent-primary);
          margin-top: 6px;
          flex-shrink: 0;
        }
        .timeline-content p {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .activity-link {
          color: var(--text-primary);
          font-weight: 600;
          text-decoration: underline;
        }
        .activity-time {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .empty-box {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .dashboard-account-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }
        .account-card {
          padding: 28px;
        }
        .account-card h3 {
          font-family: var(--font-display);
          font-size: 1.2rem;
          margin-bottom: 18px;
        }
        .account-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .alert-box {
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          margin-bottom: 14px;
        }
        .alert-box.success {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .alert-box.error {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .backup-desc {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .backup-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        @media (max-width: 900px) {
          .dashboard-two-col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

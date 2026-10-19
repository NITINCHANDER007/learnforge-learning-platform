import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Shield, Lock, KeyRound, Eye, EyeOff, AlertCircle, ArrowLeft, LogOut, CheckCircle } from 'lucide-react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import CustomCursor from './components/CustomCursor';

import Home from './pages/Home';
import Lesson from './pages/Lesson';
import Playground from './pages/Playground';
import Dashboard from './pages/Dashboard';
import Bookmarks from './pages/Bookmarks';
import Notes from './pages/Notes';
import Certificate from './pages/Certificate';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Practice from './pages/Practice';
import ProblemSolver from './pages/ProblemSolver';
import InterviewPrep from './pages/InterviewPrep';
import SeoDashboard from './pages/SeoDashboard';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-state">Authenticating session...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

// Admin Route Guard - Strictly requires verified Administrator ID & Password
function AdminRoute({ children }) {
  const { user, isAuthenticated, isAdmin, loading, login, logout } = useAuth();
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  if (loading) return <div className="loading-state">Verifying administrator access...</div>;

  // If already authenticated with verified administrator role, unlock Admin Panel directly
  if (isAuthenticated && isAdmin) {
    return children;
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminIdentifier.trim() || !adminPassword.trim()) {
      setAuthError('Please enter both Administrator ID and Password.');
      return;
    }

    setSubmitting(true);
    setAuthError('');

    try {
      const res = await login(adminIdentifier.trim(), adminPassword);
      if (res.user?.role !== 'admin') {
        logout();
        setAuthError('Access Denied: This account does not possess administrator privileges. Only authorized Admin ID and Password can open this panel.');
      }
      // If role === 'admin', AuthContext automatically updates isAdmin to true and renders children!
    } catch (err) {
      setAuthError(err.message || 'Invalid Administrator ID or Password. Access denied.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-gate-container">
      <div className="admin-gate-card">
        <div className="admin-gate-header">
          <div className="admin-gate-icon-circle">
            <Shield size={36} className="gate-shield-icon" />
          </div>
          <div className="admin-restricted-badge">
            <Lock size={12} />
            <span>RESTRICTED ACCESS · ADMIN CREDENTIALS REQUIRED</span>
          </div>
          <h2>Administrator Portal</h2>
          <p className="admin-gate-desc">
            This management console is strictly restricted. Only verified Administrator accounts with authorized ID and Password can open this panel.
          </p>
        </div>

        {isAuthenticated && !isAdmin && (
          <div className="admin-gate-student-notice">
            <div className="student-notice-info">
              <AlertCircle size={17} className="student-notice-icon" />
              <div>
                <strong>Non-Admin Session Detected</strong>
                <p>
                  Signed in as <em>{user?.name}</em> ({user?.email || user?.phone}). This student account does not have admin permissions.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="student-switch-btn"
              onClick={() => logout()}
            >
              <LogOut size={13} /> Sign Out Student
            </button>
          </div>
        )}

        {authError && (
          <div className="admin-gate-error">
            <AlertCircle size={18} />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="admin-gate-form">
          <div className="admin-form-group">
            <label htmlFor="admin-id-input">
              <span>Administrator ID</span>
              <span className="admin-id-hint">(Email or Mobile)</span>
            </label>
            <div className="admin-input-wrapper">
              <KeyRound size={17} className="input-adornment-icon" />
              <input
                id="admin-id-input"
                type="text"
                value={adminIdentifier}
                onChange={(e) => setAdminIdentifier(e.target.value)}
                placeholder="e.g. codernitin55@gmail.com"
                required
                autoComplete="username"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-pass-input">
              <span>Administrator Password</span>
            </label>
            <div className="admin-input-wrapper">
              <Lock size={17} className="input-adornment-icon" />
              <input
                id="admin-pass-input"
                type={showPassword ? 'text' : 'password'}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter administrator password"
                required
                autoComplete="current-password"
                disabled={submitting}
              />
              <button
                type="button"
                className="admin-pass-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary admin-auth-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="admin-spin-loader"></span>
                <span>Authenticating Administrator...</span>
              </>
            ) : (
              <>
                <Shield size={18} />
                <span>Verify Admin Credentials & Open</span>
              </>
            )}
          </button>
        </form>

        <div className="admin-gate-footer">
          <Link to="/" className="admin-return-link">
            <ArrowLeft size={14} /> Return to Homepage
          </Link>
        </div>
      </div>

      <style>{`
        .admin-gate-container {
          min-height: calc(100vh - 160px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
          background: radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.08) 0%, transparent 60%);
        }
        .admin-gate-card {
          max-width: 480px;
          width: 100%;
          background: #0d1322 !important;
          border: 1px solid rgba(99, 102, 241, 0.35);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(99, 102, 241, 0.12);
          border-radius: 16px;
          padding: 38px 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        [data-theme='light'] .admin-gate-card {
          background: #ffffff !important;
          border: 1px solid rgba(99, 102, 241, 0.3) !important;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.12), 0 0 35px rgba(99, 102, 241, 0.1) !important;
        }
        .admin-gate-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .admin-gate-icon-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.15);
          border: 2px solid rgba(99, 102, 241, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #818cf8;
          box-shadow: 0 0 25px rgba(99, 102, 241, 0.25);
        }
        .admin-restricted-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #fbbf24;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .admin-gate-header h2 {
          font-family: var(--font-display);
          font-size: 1.65rem;
          font-weight: 800;
          color: #f1f5f9;
          margin: 4px 0 0;
        }
        .admin-gate-desc {
          color: #94a3b8;
          font-size: 0.92rem;
          line-height: 1.55;
          margin: 0;
        }
        .admin-gate-student-notice {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .student-notice-info {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #fbbf24;
          font-size: 0.85rem;
          line-height: 1.45;
        }
        .student-notice-info strong {
          display: block;
          color: #fde68a;
          margin-bottom: 2px;
        }
        .student-notice-info p {
          margin: 0;
          color: #cbd5e1;
        }
        .student-switch-btn {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid rgba(245, 158, 11, 0.4);
          color: #fde68a;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .student-switch-btn:hover {
          background: rgba(245, 158, 11, 0.35);
        }
        .admin-gate-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #fca5a5;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          gap: 10px;
          line-height: 1.45;
        }
        .admin-gate-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .admin-form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .admin-form-group label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.84rem;
          font-weight: 600;
          color: #cbd5e1;
        }
        .admin-id-hint {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 400;
        }
        .admin-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-adornment-icon {
          position: absolute;
          left: 14px;
          color: #64748b;
          pointer-events: none;
        }
        .admin-input-wrapper input {
          width: 100%;
          background: #070a12;
          border: 1px solid #1e293b;
          border-radius: 9px;
          padding: 12px 42px 12px 42px;
          color: #f8fafc;
          font-size: 0.92rem;
          transition: all 0.2s;
          outline: none;
        }
        .admin-input-wrapper input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
          background: #090e1a;
        }
        .admin-pass-toggle {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .admin-pass-toggle:hover {
          color: #94a3b8;
        }
        .admin-auth-btn {
          width: 100%;
          padding: 13px;
          border-radius: 9px;
          font-size: 0.96rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 4px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border: none;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 18px rgba(99, 102, 241, 0.35);
        }
        .admin-auth-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(99, 102, 241, 0.45);
        }
        .admin-auth-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .admin-spin-loader {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .admin-gate-footer {
          text-align: center;
          padding-top: 6px;
          border-top: 1px solid #1e293b;
        }
        .admin-return-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          font-size: 0.85rem;
          text-decoration: none;
          transition: color 0.2s;
        }
        .admin-return-link:hover {
          color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}

function MainLayout() {
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-root">
      <CustomCursor />
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="app-main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/practice/:slug" element={<ProblemSolver />} />
          <Route path="/interview-prep" element={<InterviewPrep />} />

          {/* Student routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
          <Route path="/dashboard/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path="/dashboard/certificate/:subjectSlug" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/seo-backlinks" element={<AdminRoute><SeoDashboard /></AdminRoute>} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Curriculum Lesson Viewer Routes */}
          <Route path="/:subjectSlug" element={<Lesson />} />
          <Route path="/:subjectSlug/:lessonSlug" element={<Lesson />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

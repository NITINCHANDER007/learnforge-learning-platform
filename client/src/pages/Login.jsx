import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(identifier, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <span className="auth-icon-badge">⚡</span>
          <h2>Sign in to DataDrix</h2>
          <p>Access your curriculum progress, bookmarks, and certifications.</p>
        </div>

        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address or Mobile Number</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="field-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="name@example.com or +1234567890"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>
            <div className="input-icon-wrap">
              <Lock size={16} className="field-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            🔒 <strong>Server Alert:</strong> An automated security sign-in notification will be dispatched to your registered email or mobile upon login.
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account yet?</span>
          <Link to="/register" className="auth-switch-link">Create Account</Link>
        </div>
      </div>

      <style>{`
        .auth-page-container {
          min-height: calc(100vh - 68px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }
        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: 40px;
          border-radius: var(--radius-xl);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 28px;
        }
        .auth-icon-badge {
          font-size: 2.2rem;
          margin-bottom: 12px;
          display: inline-block;
        }
        .auth-header h2 {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .auth-header p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-top: 6px;
        }
        .auth-error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          border-radius: var(--radius-md);
          font-size: 0.88rem;
          margin-bottom: 20px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
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
        .input-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
        }
        .form-input {
          width: 100%;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 12px 14px 12px 42px;
          color: var(--text-primary);
          transition: border-color var(--transition-fast);
        }
        .form-input:focus {
          outline: none;
          border-color: var(--accent-primary);
        }
        .btn-block {
          width: 100%;
          padding: 12px;
          margin-top: 8px;
        }
        .demo-credentials-box {
          margin-top: 24px;
          padding: 14px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          border: 1px dashed var(--border-color);
          text-align: center;
        }
        .demo-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          display: block;
          margin-bottom: 8px;
        }
        .demo-btn-row {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .demo-pill {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.3);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }
        .demo-pill:hover {
          background: rgba(99, 102, 241, 0.25);
        }
        .auth-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .auth-switch-link {
          color: var(--accent-primary);
          font-weight: 600;
          margin-left: 6px;
        }
      `}</style>
    </div>
  );
}

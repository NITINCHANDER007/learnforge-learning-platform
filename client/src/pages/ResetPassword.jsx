import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Lock, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    async function verify() {
      try {
        const res = await api.verifyResetToken(token);
        if (res.success) {
          setTokenValid(true);
          setUserInfo(res.user);
        }
      } catch (err) {
        setError(err.message || 'Password reset link is invalid or has expired.');
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    }
    if (token) {
      verify();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({
        token,
        newPassword
      });
      setSuccessMsg(res.message || 'Password updated successfully!');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="auth-page-container">
        <div className="auth-card glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Verifying secure reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <span className="auth-icon-badge">
            <ShieldCheck size={22} color="#10b981" />
          </span>
          <h2>Create New Password</h2>
          <p>
            {userInfo ? `Reset password for ${userInfo.name} (${userInfo.email || userInfo.phone})` : 'Enter and confirm your new secure password.'}
          </p>
        </div>

        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-success-alert">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {tokenValid ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>New Password (min 6 characters)</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="field-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="field-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              <span>{loading ? 'Saving...' : 'Set New Password'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/forgot-password" className="btn btn-primary btn-block">
              Request a New Link
            </Link>
          </div>
        )}

        <div className="auth-footer-nav" style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/login" className="back-link">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>

      <style>{`
        .auth-page-container {
          min-height: calc(100vh - 68px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }
        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: 36px 32px;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 28px;
        }
        .auth-icon-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          margin-bottom: 16px;
        }
        .auth-header h2 {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--text-primary);
        }
        .auth-header p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .auth-error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          font-size: 0.85rem;
          margin-bottom: 20px;
        }
        .auth-success-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #6ee7b7;
          font-size: 0.85rem;
          margin-bottom: 20px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
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
          padding: 11px 14px 11px 40px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: all var(--transition-fast);
        }
        .form-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
        .btn-block {
          width: 100%;
          padding: 12px;
          font-size: 1rem;
          margin-top: 4px;
        }
        .auth-footer-nav {
          font-size: 0.85rem;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
          transition: color var(--transition-fast);
        }
        .back-link:hover {
          color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}

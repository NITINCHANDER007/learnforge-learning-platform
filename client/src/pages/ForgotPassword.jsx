import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Mail, Phone, Lock, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, ShieldCheck, ExternalLink } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Request, 2: Enter OTP & New Password
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [serverToken, setServerToken] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const navigate = useNavigate();

  // Step 1: Send Reset Request
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setError('Please provide your registered email or mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(identifier.trim());
      setSuccessMsg(res.message || 'Password reset instructions have been dispatched.');
      if (res.token) setServerToken(res.token);
      if (res.otp) setOtp(res.otp); // Pre-fill in local dev for convenient testing
      if (res.previewUrl) setPreviewUrl(res.previewUrl);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Could not request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code sent to your email/mobile.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({
        token: serverToken,
        otp: otp.trim(),
        newPassword
      });
      setSuccessMsg(res.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <span className="auth-icon-badge">
            <KeyRound size={22} color="#818cf8" />
          </span>
          <h2>Reset Your Password</h2>
          <p>
            {step === 1
              ? 'Enter your registered email or mobile number to receive verification instructions.'
              : 'Enter the verification code sent to you along with your new password.'}
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

        {step === 1 ? (
          <form onSubmit={handleRequestReset} className="auth-form">
            <div className="form-group">
              <label>Registered Email or Mobile Number</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="field-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="name@example.com or +1234567890"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <span className="field-helper-text">
                We will dispatch an automated email or SMS message through our server.
              </span>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              <span>{loading ? 'Sending Instructions...' : 'Send Reset Link & Code'}</span>
              <ArrowRight size={16} />
            </button>

            <div className="auth-footer-nav">
              <Link to="/login" className="back-link">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: '#bae6fd' }}>
              ✓ Security code dispatched. Enter the 6-digit code received on your registered account below.
            </div>

            <div className="form-group">
              <label>6-Digit Verification Code (OTP)</label>
              <div className="input-icon-wrap">
                <ShieldCheck size={16} className="field-icon" />
                <input
                  type="text"
                  className="form-input otp-input"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>

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
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
              <ArrowRight size={16} />
            </button>

            <div className="auth-footer-nav" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn-inline"
                onClick={() => { setStep(1); setError(null); }}
              >
                ← Change Email/Phone
              </button>
              <Link to="/login" className="back-link">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
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
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
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
        .field-helper-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.4;
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
        .otp-input {
          font-family: var(--font-mono);
          font-size: 1.2rem;
          letter-spacing: 4px;
          font-weight: 700;
          color: #38bdf8;
        }
        .btn-block {
          width: 100%;
          padding: 12px;
          font-size: 1rem;
          margin-top: 4px;
        }
        .auth-footer-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
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
        .btn-inline {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          padding: 0;
        }
        .btn-inline:hover {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}

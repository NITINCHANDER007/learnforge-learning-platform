import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle, CheckCircle, ExternalLink, Plus, X } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [contactMode, setContactMode] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showSecondary, setShowSecondary] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signupResult, setSignupResult] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation: Exactly one primary contact is mandatory!
    if (contactMode === 'email' && !email.trim()) {
      setError('Please provide your email address.');
      return;
    }
    if (contactMode === 'phone' && !phone.trim()) {
      setError('Please provide your mobile phone number.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password
      });

      setSignupResult(res);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <span className="auth-icon-badge">🚀</span>
          <h2>Join LearnForge Academy</h2>
          <p>Create your student account to track progress, earn certificates, and master skills.</p>
        </div>

        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {signupResult && (
          <div className="auth-success-alert" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <CheckCircle size={18} color="#10b981" />
              <span>{signupResult.message || 'Account successfully created!'}</span>
            </div>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Redirecting to your dashboard in a moment...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-icon-wrap">
              <User size={16} className="field-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Contact Method Selector: One is Mandatory! */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label>Sign Up With (Choose One Mandatory)</label>
              <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: 600 }}>One is required</span>
            </div>

            <div className="contact-mode-switch">
              <button
                type="button"
                className={`mode-btn ${contactMode === 'email' ? 'active' : ''}`}
                onClick={() => { setContactMode('email'); setError(null); }}
              >
                <Mail size={14} /> Email Address
              </button>
              <button
                type="button"
                className={`mode-btn ${contactMode === 'phone' ? 'active' : ''}`}
                onClick={() => { setContactMode('phone'); setError(null); }}
              >
                <Phone size={14} /> Mobile Number
              </button>
            </div>
          </div>

          {/* Primary Mandatory Field */}
          {contactMode === 'email' ? (
            <div className="form-group">
              <label>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
              <div className="input-icon-wrap">
                <Mail size={16} className="field-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="ada@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <span className="field-sub-note">
                Our server will dispatch an automated welcome notification to this email address.
              </span>

              {/* Optional Secondary Phone */}
              {!showSecondary ? (
                <button
                  type="button"
                  className="add-secondary-toggle"
                  onClick={() => setShowSecondary(true)}
                >
                  <Plus size={13} /> Also add mobile number (optional)
                </button>
              ) : (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mobile Number (Optional)</label>
                    <button type="button" className="close-secondary-btn" onClick={() => { setShowSecondary(false); setPhone(''); }}>
                      <X size={12} /> Remove
                    </button>
                  </div>
                  <div className="input-icon-wrap" style={{ marginTop: '6px' }}>
                    <Phone size={16} className="field-icon" />
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91 9876543210 or +1 555 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label>Mobile Number (SMS) <span style={{ color: '#ef4444' }}>*</span></label>
              <div className="input-icon-wrap">
                <Phone size={16} className="field-icon" />
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 9876543210 or +1 (555) 000-1234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <span className="field-sub-note">
                Our server will dispatch an automated welcome SMS text message to this number.
              </span>

              {/* Optional Secondary Email */}
              {!showSecondary ? (
                <button
                  type="button"
                  className="add-secondary-toggle"
                  onClick={() => setShowSecondary(true)}
                >
                  <Plus size={13} /> Also add email address (optional)
                </button>
              ) : (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email Address (Optional)</label>
                    <button type="button" className="close-secondary-btn" onClick={() => { setShowSecondary(false); setEmail(''); }}>
                      <X size={12} /> Remove
                    </button>
                  </div>
                  <div className="input-icon-wrap" style={{ marginTop: '6px' }}>
                    <Mail size={16} className="field-icon" />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="ada@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label>Password (min 6 characters)</label>
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
            ⚡ <strong>Automated Server Dispatch:</strong> Upon registration, our server immediately transmits a confirmation message and welcome onboarding link.
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            <span>{loading ? 'Creating Account...' : 'Get Started'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login" className="auth-switch-link">Sign In</Link>
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
          max-width: 460px;
          padding: 36px 32px;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .auth-icon-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          margin-bottom: 12px;
          font-size: 22px;
        }
        .auth-header h2 {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 6px;
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
          padding: 14px 18px;
          border-radius: var(--radius-md);
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #6ee7b7;
          margin-bottom: 20px;
        }
        .contact-mode-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          background: var(--bg-secondary);
          padding: 4px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }
        .mode-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .mode-btn.active {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          border: 1px solid rgba(99, 102, 241, 0.4);
        }
        .field-sub-note {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 4px;
          line-height: 1.4;
        }
        .add-secondary-toggle {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: #818cf8;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          padding: 6px 0 0;
          text-align: left;
        }
        .add-secondary-toggle:hover {
          text-decoration: underline;
        }
        .close-secondary-btn {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.75rem;
          cursor: pointer;
        }
        .close-secondary-btn:hover {
          color: #ef4444;
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
          padding: 10px 14px 10px 40px;
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
          margin-top: 6px;
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
        .auth-switch-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

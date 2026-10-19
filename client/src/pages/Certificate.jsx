import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { Award, Printer, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function Certificate() {
  const { subjectSlug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCert() {
      try {
        const res = await api.getCertificate(subjectSlug);
        if (res.success) {
          setData(res.certificate);
          // Trigger confetti!
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.5 }
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCert();
  }, [subjectSlug]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="cert-loading">Generating Certificate...</div>;
  }

  if (error || !data) {
    return (
      <div className="cert-error glass-panel">
        <h2>Unable to Generate Certificate</h2>
        <p>{error || 'You have not completed lessons in this track yet.'}</p>
        <Link to={`/${subjectSlug}`} className="btn btn-primary">Continue Curriculum</Link>
      </div>
    );
  }

  return (
    <div className="certificate-page-container">
      {/* Controls Bar */}
      <div className="cert-controls-bar no-print glass-panel">
        <Link to="/dashboard" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
          <Printer size={16} /> Print or Save as PDF
        </button>
      </div>

      {/* Official Certificate Card */}
      <div className="certificate-frame-outer">
        <div className="certificate-frame-inner">
          <div className="cert-corner top-left"></div>
          <div className="cert-corner top-right"></div>
          <div className="cert-corner bottom-left"></div>
          <div className="cert-corner bottom-right"></div>

          <div className="cert-header">
            <div className="cert-logo">⚡ DataDrix Academy</div>
            <span className="cert-motto">Official Certificate of Achievement</span>
          </div>

          <div className="cert-body">
            <span className="cert-present-to">This is proudly presented to</span>
            <h1 className="cert-recipient-name">{data.userName}</h1>

            <p className="cert-declaration">
              for successfully mastering and demonstrating foundational competence in the curriculum of
            </p>

            <h2 className="cert-subject-title">{data.subjectTitle}</h2>

            <p className="cert-details">
              Completed {data.completedCount} of {data.totalLessons} practical lessons ({data.percentage}% completion).
            </p>
          </div>

          <div className="cert-footer">
            <div className="cert-footer-col">
              <span className="cert-date">{data.issueDate}</span>
              <span className="cert-footer-label">Date of Issue</span>
            </div>

            <div className="cert-seal-wrap">
              <div className="cert-seal">
                <ShieldCheck size={36} />
                <span>VERIFIED</span>
              </div>
            </div>

            <div className="cert-footer-col">
              <span className="cert-id">{data.certId}</span>
              <span className="cert-footer-label">Credential Verification ID</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .certificate-page-container {
          max-width: 1040px;
          margin: 0 auto;
          padding: 40px 24px 80px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-items: center;
        }
        .cert-controls-bar {
          width: 100%;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .certificate-frame-outer {
          width: 100%;
          max-width: 960px;
          aspect-ratio: 1.414 / 1;
          background: #ffffff;
          color: #0f172a;
          border: 12px solid #1e293b;
          border-radius: 12px;
          box-shadow: 0 24px 72px rgba(0, 0, 0, 0.5);
          padding: 16px;
          display: flex;
        }
        .certificate-frame-inner {
          width: 100%;
          height: 100%;
          border: 2px dashed #94a3b8;
          border-radius: 6px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: center;
          position: relative;
          background: radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%);
        }
        .cert-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .cert-logo {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 800;
          color: #4338ca;
          letter-spacing: -0.02em;
        }
        .cert-motto {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #64748b;
          font-weight: 600;
        }
        .cert-present-to {
          font-size: 1rem;
          color: #64748b;
          font-style: italic;
        }
        .cert-recipient-name {
          font-family: var(--font-display);
          font-size: 2.8rem;
          font-weight: 800;
          color: #0f172a;
          margin: 12px 0 16px;
          text-decoration: underline;
          text-decoration-color: #6366f1;
        }
        .cert-declaration {
          font-size: 1rem;
          color: #475569;
          max-width: 600px;
          margin: 0 auto 12px;
          line-height: 1.5;
        }
        .cert-subject-title {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: #312e81;
          margin-bottom: 8px;
        }
        .cert-details {
          font-size: 0.95rem;
          color: #64748b;
        }
        .cert-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }
        .cert-footer-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cert-date, .cert-id {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          font-weight: 600;
          color: #0f172a;
        }
        .cert-footer-label {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cert-seal {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px double #d97706;
          color: #d97706;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          margin: 0 auto;
        }
        @media print {
          body {
            background: white !important;
          }
          .no-print, header, footer {
            display: none !important;
          }
          .certificate-page-container {
            padding: 0;
            margin: 0;
          }
          .certificate-frame-outer {
            box-shadow: none;
            border-width: 6px;
          }
        }
      `}</style>
    </div>
  );
}

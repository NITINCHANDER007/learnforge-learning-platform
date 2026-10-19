import React, { useState } from 'react';
import { Target, Star, ChevronDown, ChevronUp, CheckCircle, Search, Layers, Database, Cpu, Box, Code2, Sparkles } from 'lucide-react';

const TRACKS = [
  { id: 'all', name: 'All Questions', icon: '🎯' },
  { id: 'google', name: 'Google', icon: '🌐' },
  { id: 'amazon', name: 'Amazon', icon: '📦' },
  { id: 'microsoft', name: 'Microsoft', icon: '🪟' },
  { id: 'meta', name: 'Meta', icon: '♾️' },
  { id: 'dbms', name: 'DBMS & SQL', icon: '🗄️' },
  { id: 'os', name: 'Operating Systems', icon: '💻' },
  { id: 'oops', name: 'OOPs & SOLID', icon: '🧩' },
  { id: 'system-design', name: 'System Design', icon: '📐' },
  { id: 'python-core', name: 'Python Internals', icon: '🐍' }
];

const QUESTIONS = [
  {
    id: 'q-dbms-acid',
    title: 'Explain ACID Properties with a Real-World Banking Example',
    category: 'dbms',
    companies: ['Amazon', 'Microsoft', 'TCS'],
    difficulty: 'Easy',
    importance: 'High Frequency',
    summary: 'Atomicity (all or nothing), Consistency (preserves invariants), Isolation (concurrent independence), Durability (written to non-volatile log).',
    details: `In a banking transfer of $100 from Account A to Account B:

• Atomicity: Deducting A and crediting B must both succeed or neither does. If power fails midway, A's deduction is rolled back.
• Consistency: The total money across both accounts remains unchanged before and after the transaction.
• Isolation: Other simultaneous transactions cannot read partial balance deductions or interfere with this operation.
• Durability: Once committed, the record survives power outages, network loss, and system reboot via WAL (Write-Ahead Logging).`
  },
  {
    id: 'q-dbms-index',
    title: 'How Does Database Indexing Work (Clustered vs Non-Clustered)?',
    category: 'dbms',
    companies: ['Google', 'Amazon', 'Microsoft'],
    difficulty: 'Medium',
    importance: 'High Frequency',
    summary: 'Indexes use B+ Trees to reduce row search complexity from O(N) full table scans to O(log N).',
    details: `Key Differences:

1. Clustered Index:
   • Determines the physical order of data rows on disk.
   • Leaf nodes contain the actual data pages.
   • Only 1 per table (normally created automatically on PRIMARY KEY).

2. Non-Clustered Index:
   • Stored in a separate structure from data rows.
   • Leaf nodes contain index keys and row locators (pointers).
   • Tables can have multiple non-clustered indexes for specific lookups.`
  },
  {
    id: 'q-os-deadlock',
    title: 'What is Deadlock and the Four Coffman Conditions?',
    category: 'os',
    companies: ['Amazon', 'Microsoft', 'Google'],
    difficulty: 'Medium',
    importance: 'Core Essential',
    summary: 'A deadlock happens when processes hold resources and wait indefinitely for resources held by each other.',
    details: `The 4 Coffman Conditions (all must hold simultaneously for deadlock):

1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A process holds resources while requesting new ones.
3. No Preemption: Resources cannot be forcibly taken; only released voluntarily.
4. Circular Wait: A closed chain of processes where each holds a resource needed by the next.

Prevention:
Break Circular Wait by enforcing global ascending lock acquisition order across all threads!`
  },
  {
    id: 'q-oops-solid',
    title: 'Explain the SOLID Principles with Examples',
    category: 'oops',
    companies: ['Google', 'Meta', 'Amazon'],
    difficulty: 'Medium',
    importance: 'High Frequency',
    summary: 'Five object-oriented design principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.',
    details: `SOLID Principles:

• S - Single Responsibility (SRP): A class should have one, and only one, reason to change.
• O - Open/Closed (OCP): Entities should be open for extension, but closed for modification.
• L - Liskov Substitution (LSP): Subtypes must be substitutable for their base types without altering correctness.
• I - Interface Segregation (ISP): Clients should not be forced to depend on interfaces they do not use.
• D - Dependency Inversion (DIP): High-level modules should depend on abstractions, not concrete implementations.`
  },
  {
    id: 'q-py-gil',
    title: "What is Python's Global Interpreter Lock (GIL) and How to Bypass It?",
    category: 'python-core',
    companies: ['Google', 'Meta', 'Amazon'],
    difficulty: 'Medium',
    importance: 'High Frequency',
    summary: 'The GIL allows only one native thread to execute Python bytecode at a time in CPython to protect reference counting.',
    details: `Impact and Workarounds:

• I/O-Bound Workloads: Multi-threading or asyncio is highly effective because GIL is released during I/O wait (network, disk, DB).
• CPU-Bound Workloads: Threads serialize on the GIL and offer zero CPU multi-core parallelization.
• Bypassing the GIL:
  1. Multiprocessing: Use multiprocessing.Pool or ProcessPoolExecutor.
  2. C/C++ Extensions: NumPy, Polars, and PyTorch release GIL during matrix calculations.
  3. Python 3.13+ Free-Threaded Mode: Optional PEP 703 build without the GIL.`
  }
];

export default function InterviewPrep() {
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [masteredList, setMasteredList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mastered_interview') || '[]');
    } catch {
      return [];
    }
  });

  const toggleMastered = (id) => {
    setMasteredList(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('mastered_interview', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const filtered = QUESTIONS.filter(q => {
    if (selectedTrack !== 'all') {
      const catMatch = q.category === selectedTrack;
      const compMatch = q.companies.some(c => c.toLowerCase() === selectedTrack);
      if (!catMatch && !compMatch) return false;
    }
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      const mTitle = q.title.toLowerCase().includes(s);
      const mSum = q.summary.toLowerCase().includes(s);
      if (!mTitle && !mSum) return false;
    }
    return true;
  });

  const pct = Math.round((masteredList.length / QUESTIONS.length) * 100);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderRadius: '999px', fontSize: '12px', fontWeight: 700, marginBottom: '14px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <Sparkles size={14} /> DATADRIX INTERVIEW CORNER
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-primary)' }}>
          Technical Interview <span className="text-gradient">Corner</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '720px', margin: '0 0 24px', lineHeight: 1.6 }}>
          Comprehensive technical interview preparation covering company-specific rounds (Google, Amazon, Microsoft) and core CS foundations (DBMS, OS, OOP, System Design).
        </p>

        {/* Readiness Meter */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px 20px', maxWidth: '480px', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>
            <span style={{ color: 'var(--text-primary)' }}>🎯 Interview Readiness</span>
            <span style={{ color: '#818cf8' }}>{masteredList.length} of {QUESTIONS.length} Mastered ({pct}%)</span>
          </div>
          <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gradient-brand)', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
        {TRACKS.map(t => {
          const isActive = selectedTrack === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTrack(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: isActive ? '1px solid #6366f1' : '1px solid var(--border-color)',
                background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
                color: isActive ? '#a5b4fc' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{t.icon}</span>
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '480px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search questions (e.g. ACID, Deadlock, SOLID, GIL)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 40px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Accordion Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map(q => {
          const isMastered = masteredList.includes(q.id);
          const isExpanded = expandedId === q.id;

          return (
            <div
              key={q.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderLeft: isMastered ? '4px solid #10b981' : '1px solid var(--border-color)',
                borderRadius: '14px',
                overflow: 'hidden',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                transition: 'border-color 0.2s ease'
              }}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                style={{ padding: '18px 22px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                      {q.category.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      {q.difficulty}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      {q.importance}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '4px 0 8px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {q.title}
                  </h3>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {q.companies.map(c => (
                      <span key={c} style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleMastered(q.id); }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '999px',
                      border: isMastered ? '1px solid #10b981' : '1px solid var(--border-color)',
                      background: isMastered ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)',
                      color: isMastered ? '#34d399' : 'var(--text-secondary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Star size={14} color={isMastered ? '#10b981' : 'currentColor'} fill={isMastered ? '#10b981' : 'none'} />
                    <span>{isMastered ? 'Mastered' : 'Mark Mastered'}</span>
                  </button>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div style={{ padding: '0 22px 22px', borderTop: '1px solid var(--border-color)', fontSize: '14px', lineHeight: 1.6 }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', borderLeft: '3px solid #6366f1', padding: '12px 16px', borderRadius: '8px', margin: '18px 0', color: 'var(--text-primary)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <strong>💡 Key Takeaway:</strong> {q.summary}
                  </div>
                  <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '18px', color: 'var(--text-primary)' }}>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: '13.5px', lineHeight: 1.7 }}>
                      {q.details}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

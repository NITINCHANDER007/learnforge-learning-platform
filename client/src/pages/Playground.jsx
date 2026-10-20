import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { handleCodeEditorKeyDown } from '../utils/codeEditor';
import { Play, RotateCcw, Copy, Check, Terminal, Sparkles, Clock, AlertCircle, Cpu, Database, Server, Zap } from 'lucide-react';

const CODE_TEMPLATES = {
  python: {
    hello: `# LearnForge Python Playground\nprint("Hello from LearnForge High-Performance Python Engine!")\n\nfor i in range(1, 6):\n    print(f"Bite-sized lesson step {i}: 🔥 mastery unlocked!")\n`,
    data: `# Data Analytics & Statistics\nscores = [88, 92, 79, 95, 84, 100, 71]\n\ndef analyze_scores(data):\n    return {\n        "count": len(data),\n        "total": sum(data),\n        "average": round(sum(data) / len(data), 2),\n        "top_score": max(data),\n        "lowest": min(data)\n    }\n\nstats = analyze_scores(scores)\nprint("=== Data Analytics Report ===")\nfor k, v in stats.items():\n    print(f"{k.capitalize()}: {v}")\n`,
    loops: `# Loops & List Comprehensions\ntech_stack = ["MongoDB", "Express", "React", "Node.js", "Python", "SQL"]\n\nuppercased = [tech.upper() for tech in tech_stack]\nprint("Tech Stack (Upper):", uppercased)\n\neven_squares = [x**2 for x in range(10) if x % 2 == 0]\nprint("Even Squares:", even_squares)\n`,
    classes: `# Object-Oriented Programming (OOP)\nclass Student:\n    def __init__(self, name, track):\n        self.name = name\n        self.track = track\n        self.completed_lessons = 0\n\n    def complete_lesson(self, title):\n        self.completed_lessons += 1\n        print(f"🎉 {self.name} finished: {title}! (Total: {self.completed_lessons})")\n\ns = Student("Alex", "Full-Stack Data Engineering")\ns.complete_lesson("Python Fundamentals")\ns.complete_lesson("SQL Aggregations & Joins")\n`
  },
  javascript: {
    hello: `// LearnForge JavaScript Playground\nconsole.log("Hello from Modern JavaScript Engine!");\n\nconst items = ["MongoDB", "Express", "React", "Node", "Python"];\nconsole.log("Full Stack Stack:", items.join(" -> "));\n`,
    data: `// Data Processing with Arrays\nconst users = [\n  { name: "Alice", score: 95, role: "Admin" },\n  { name: "Bob", score: 82, role: "Student" },\n  { name: "Charlie", score: 91, role: "Student" }\n];\n\nconst avg = users.reduce((acc, u) => acc + u.score, 0) / users.length;\nconsole.log("Average Student Score:", avg.toFixed(2));\n`
  },
  sql: {
    aggregations: `-- LearnForge SQL Interactive Engine (SQLite)\nSELECT department, COUNT(*) AS total_staff, AVG(salary) AS average_salary\nFROM employees\nGROUP BY department\nORDER BY average_salary DESC;\n`,
    filter: `-- Filter high-performing staff\nSELECT name, department, salary, hire_date\nFROM employees\nWHERE salary >= 85000\nORDER BY salary DESC;\n`,
    students: `-- Organization Student Roster\nSELECT name, track, score, status\nFROM students\nWHERE score >= 90\nORDER BY score DESC;\n`
  }
};

function resolveSafeLanguage(rawLang, rawCode) {
  const codeStr = rawCode || '';
  const lang = (rawLang || '').toLowerCase();

  if (lang === 'sql') return 'sql';
  if (lang === 'python' || lang === 'py') return 'python';
  if (lang === 'javascript' || lang === 'js') return 'javascript';

  const isSqlSyntax = /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)\s+/im.test(codeStr);
  const isPythonSyntax = /^\s*(def\s+\w+|import\s+\w+|from\s+\w+\s+import|print\(|class\s+\w+.*:|elif\s+|if\s+__name__\s*==)/m.test(codeStr);
  const isJsSyntax = /^\s*(const\s+\w+|let\s+\w+|var\s+\w+|console\.log|function\s+\w+|=>)/m.test(codeStr);

  if (isSqlSyntax) return 'sql';
  if (isPythonSyntax && !isJsSyntax) return 'python';
  if (isJsSyntax && !isPythonSyntax) return 'javascript';

  return 'python';
}

export default function Playground() {
  const [searchParams] = useSearchParams();
  const rawLangParam = searchParams.get('lang');
  const initialCode = searchParams.get('code') || '';
  const initialLang = resolveSafeLanguage(rawLangParam, initialCode);

  const [language, setLanguage] = useState(initialLang);
  const [code, setCode] = useState(initialCode || CODE_TEMPLATES[initialLang]?.hello || CODE_TEMPLATES.python.hello);
  const [output, setOutput] = useState('Click "▶ Run Code" or press Ctrl+Enter to execute.');
  const [isRunning, setIsRunning] = useState(false);
  const [execTime, setExecTime] = useState(null);
  const [usedEngine, setUsedEngine] = useState('');
  const [copied, setCopied] = useState(false);

  // Execution engine mode: 'auto' | 'server' | 'browser'
  const [engineMode, setEngineMode] = useState('auto');

  // WebAssembly Pyodide State
  const [pyodideReady, setPyodideReady] = useState(false);
  const [pyodideStatus, setPyodideStatus] = useState('Checking execution runtime...');
  const pyodideInstanceRef = useRef(null);
  const autorunExecutedRef = useRef(false);

  // Initialize Pyodide WebAssembly with CDN fallback
  useEffect(() => {
    let isMounted = true;

    async function initPyodide() {
      try {
        if (!window.loadPyodide) {
          // Check if script tag is already in DOM
          let script = document.querySelector('script[src*="pyodide"]');
          if (!script) {
            script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
            document.head.appendChild(script);
          }

          // Wait for script to load with timeout
          let retries = 0;
          while (!window.loadPyodide && retries < 15) {
            await new Promise(r => setTimeout(r, 200));
            retries++;
          }
        }

        if (window.loadPyodide && !pyodideInstanceRef.current) {
          if (isMounted) setPyodideStatus('Initializing WebAssembly...');
          const pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/'
          });
          if (isMounted) {
            pyodideInstanceRef.current = pyodide;
            setPyodideReady(true);
            setPyodideStatus('Dual Engine Ready (Server + WebAssembly)');
          }
        } else if (!window.loadPyodide) {
          if (isMounted) {
            setPyodideStatus('Server Engine Ready (Python 3.14)');
          }
        }
      } catch (err) {
        if (isMounted) {
          // If WebAssembly fails, the Server engine will take over seamlessly
          setPyodideStatus('Server Engine Ready (Python 3.14)');
        }
      }
    }

    initPyodide();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update code if URL query params change
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
    if (rawLangParam || initialCode) {
      const resolved = resolveSafeLanguage(rawLangParam, initialCode);
      setLanguage(resolved);
    }
  }, [rawLangParam, initialCode]);

  // Execute Code
  const runCode = async (customCode, customLang) => {
    const currentCode = customCode !== undefined ? customCode : code;
    const currentLang = customLang !== undefined ? customLang : language;

    setIsRunning(true);
    setOutput('Executing code...');
    setUsedEngine('');
    const startTime = performance.now();

    // 1. SQL Execution -> Always use Server SQLite Engine
    if (currentLang === 'sql') {
      try {
        const res = await api.executeCode({ language: 'sql', code: currentCode });
        const endTime = performance.now();
        const duration = res.duration || ((endTime - startTime) / 1000).toFixed(3) + 's';
        setExecTime(duration);
        setUsedEngine(res.engine || 'SQLite 3 (Server Engine)');

        if (res.stderr) {
          setOutput(`[SQL Error]:\n${res.stderr}`);
        } else {
          setOutput(res.stdout || 'Statement executed successfully. (0 rows returned)');
        }
      } catch (err) {
        setOutput(`Execution failed: ${err.message}`);
      } finally {
        setIsRunning(false);
      }
      return;
    }

    // 2. Python Execution -> Dual Engine (WebAssembly + High-speed Server Runtime)
    if (currentLang === 'python') {
      // Determine if we should use server directly or try WebAssembly
      const shouldPreferServer = engineMode === 'server' || !pyodideReady;

      if (!shouldPreferServer && pyodideInstanceRef.current) {
        try {
          const py = pyodideInstanceRef.current;
          py.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
          `);

          await py.runPythonAsync(currentCode);

          const stdout = py.runPython('sys.stdout.getvalue()');
          const stderr = py.runPython('sys.stderr.getvalue()');
          const endTime = performance.now();
          const duration = ((endTime - startTime) / 1000).toFixed(3) + 's';
          setExecTime(duration);
          setUsedEngine('Python 3 (WebAssembly)');

          if (stderr) {
            setOutput(`${stdout ? stdout + '\n' : ''}--- STDERR ---\n${stderr}`);
          } else if (stdout) {
            setOutput(stdout);
          } else {
            setOutput('Program completed with no output.');
          }
          setIsRunning(false);
          return;
        } catch (wasmErr) {
          console.warn('[Playground] WebAssembly error, falling back to Server Compiler:', wasmErr.message);
        }
      }

      // High-Performance Server Execution (Python 3.14)
      try {
        const res = await api.executeCode({ language: 'python', code: currentCode });
        const endTime = performance.now();
        const duration = res.duration || ((endTime - startTime) / 1000).toFixed(3) + 's';
        setExecTime(duration);
        setUsedEngine(res.engine || 'Python 3.14 (Server Environment)');

        if (res.stderr) {
          setOutput(`${res.stdout ? res.stdout + '\n' : ''}--- STDERR ---\n${res.stderr}`);
        } else if (res.stdout) {
          setOutput(res.stdout);
        } else {
          setOutput('Program completed with no output.');
        }
      } catch (serverErr) {
        setOutput(`Execution Error:\n${serverErr.message}`);
      } finally {
        setIsRunning(false);
      }
      return;
    }

    // 3. JavaScript Execution
    if (currentLang === 'javascript') {
      if (engineMode === 'server') {
        try {
          const res = await api.executeCode({ language: 'javascript', code: currentCode });
          const endTime = performance.now();
          const duration = res.duration || ((endTime - startTime) / 1000).toFixed(3) + 's';
          setExecTime(duration);
          setUsedEngine(res.engine || 'Node.js V8 (Server Environment)');

          if (res.stderr) {
            setOutput(`${res.stdout ? res.stdout + '\n' : ''}--- STDERR ---\n${res.stderr}`);
          } else {
            setOutput(res.stdout || 'Code executed successfully (no console output).');
          }
        } catch (err) {
          setOutput(`Server JS Execution Error: ${err.message}`);
        } finally {
          setIsRunning(false);
        }
        return;
      }

      // Browser JavaScript Execution with console capture
      let logs = [];
      const originalLog = console.log;
      const originalError = console.error;

      console.log = (...args) => {
        logs.push(args.map(a => {
          if (typeof a === 'object' && a !== null) {
            try {
              return JSON.stringify(a, null, 2);
            } catch {
              return String(a);
            }
          }
          return String(a);
        }).join(' '));
        originalLog(...args);
      };
      console.error = (...args) => {
        logs.push('[Error] ' + args.join(' '));
        originalError(...args);
      };

      try {
        const fn = new Function(currentCode);
        fn();
        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(3) + 's';
        setExecTime(duration);
        setUsedEngine('JavaScript (V8 Browser Engine)');

        if (logs.length > 0) {
          setOutput(logs.join('\n'));
        } else {
          setOutput('Code executed successfully (no console output).');
        }
      } catch (err) {
        // Fallback to Server Node.js execution
        try {
          const res = await api.executeCode({ language: 'javascript', code: currentCode });
          const endTime = performance.now();
          setExecTime(res.duration || ((endTime - startTime) / 1000).toFixed(3) + 's');
          setUsedEngine(res.engine || 'Node.js (Server Engine)');
          setOutput(res.stdout || res.stderr || err.message);
        } catch {
          setOutput(`JavaScript Error: ${err.message}`);
        }
      } finally {
        console.log = originalLog;
        console.error = originalError;
        setIsRunning(false);
      }
    }
  };

  // Handle autorun from Lesson
  useEffect(() => {
    if (searchParams.get('autorun') === 'true' && !autorunExecutedRef.current && initialCode) {
      autorunExecutedRef.current = true;
      const resolved = resolveSafeLanguage(rawLangParam, initialCode);
      runCode(initialCode, resolved);
    }
  }, [searchParams, initialCode, rawLangParam]);

  // Self-indentation, Tab handling, auto-closing brackets, and Ctrl+Enter shortcut
  const handleKeyDown = (e) => {
    handleCodeEditorKeyDown(e, setCode, () => runCode());
  };

  const loadTemplate = (templateKey) => {
    const templates = CODE_TEMPLATES[language];
    if (templates && templates[templateKey]) {
      setCode(templates[templateKey]);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="playground-page">
      {/* Top Action & Controls Bar */}
      <div className="playground-top-bar glass-panel">
        <div className="playground-title-group">
          <Terminal size={22} className="terminal-icon" />
          <div>
            <h2>Interactive Code Compiler</h2>
            <div className="status-badge-row">
              <span className="live-engine-indicator">
                <span className="live-dot pulse"></span>
                Ready for Execution
              </span>
            </div>
          </div>
        </div>

        <div className="playground-actions-group">
          {/* Language Selector */}
          <div className="select-wrapper">
            <label>Language:</label>
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value;
                setLanguage(newLang);
                const firstKey = Object.keys(CODE_TEMPLATES[newLang] || {})[0];
                setCode(CODE_TEMPLATES[newLang]?.[firstKey] || '');
              }}
              className="code-select"
            >
              <option value="python">🐍 Python 3</option>
              <option value="javascript">⚡ JavaScript</option>
              <option value="sql">🗄️ SQL (SQLite)</option>
            </select>
          </div>

          {/* Templates Selector */}
          <div className="select-wrapper">
            <label>Template:</label>
            <select
              onChange={(e) => loadTemplate(e.target.value)}
              className="code-select"
              defaultValue="hello"
            >
              {language === 'python' && (
                <>
                  <option value="hello">Hello World</option>
                  <option value="data">Data Analytics & Stats</option>
                  <option value="loops">Loops & List Comprehension</option>
                  <option value="classes">OOP & Classes</option>
                </>
              )}
              {language === 'javascript' && (
                <>
                  <option value="hello">Hello World</option>
                  <option value="data">Array Data Pipelines</option>
                </>
              )}
              {language === 'sql' && (
                <>
                  <option value="aggregations">Department Aggregations</option>
                  <option value="filter">High Earners (Filter & Sort)</option>
                  <option value="students">Student Roster (Active)</option>
                </>
              )}
            </select>
          </div>

          {/* Engine Mode */}
          <div className="select-wrapper">
            <label>Engine:</label>
            <select
              value={engineMode}
              onChange={(e) => setEngineMode(e.target.value)}
              className="code-select engine-select"
            >
              <option value="auto">Auto (Fastest Dual)</option>
              <option value="server">Server Engine (Fastest)</option>
              <option value="browser">Browser Sandbox</option>
            </select>
          </div>

          {/* Run Button - NEVER stuck disabled */}
          <button
            type="button"
            className="btn btn-primary btn-sm run-btn"
            onClick={() => runCode()}
            disabled={isRunning}
            title="Execute Code (Ctrl + Enter)"
          >
            <Play size={15} fill="currentColor" />
            <span>{isRunning ? 'Executing...' : 'Run Code'}</span>
            <kbd>Ctrl+↵</kbd>
          </button>

          {/* Copy Code */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCopyCode}
            title="Copy code to clipboard"
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Clear Output */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setOutput('Output cleared.')}
            title="Clear Console Output"
          >
            <RotateCcw size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Editor & Console Split Panes */}
      <div className="playground-panes-grid">
        {/* Editor Pane */}
        <div className="editor-pane glass-panel">
          <div className="pane-header">
            <span className="pane-title">
              Editor (
              {language === 'python' ? 'main.py' : language === 'javascript' ? 'script.js' : 'query.sql'}
              )
            </span>
            <span className="pane-hint">Self-indenting editor · Tab to indent · Ctrl + Enter to run</span>
          </div>
          <textarea
            className="editor-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            placeholder="Write your code here..."
          />
        </div>

        {/* Output Console Pane */}
        <div className="output-pane glass-panel">
          <div className="pane-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pane-title">Console Output</span>
              {usedEngine && (
                <span className="engine-used-badge">
                  <Zap size={11} /> {usedEngine}
                </span>
              )}
            </div>
            {execTime && (
              <span className="pane-time">
                <Clock size={12} /> {execTime}
              </span>
            )}
          </div>
          <pre className="output-console-box">{output}</pre>
        </div>
      </div>

      <style>{`
        .playground-page {
          max-width: 1560px;
          margin: 0 auto;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: calc(100vh - 68px);
          box-sizing: border-box;
        }
        .playground-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          flex-wrap: wrap;
          gap: 14px;
          border-radius: var(--radius-lg);
        }
        .playground-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .terminal-icon {
          color: var(--accent-primary);
        }
        .playground-title-group h2 {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
        }
        .status-badge-row {
          margin-top: 2px;
        }
        .live-engine-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.76rem;
          color: #94a3b8;
          font-weight: 500;
        }
        .live-dot {
          width: 7px;
          height: 7px;
          background: #10b981;
          border-radius: 50%;
          display: inline-block;
        }
        .live-dot.pulse {
          box-shadow: 0 0 8px #10b981;
          animation: pulseDot 2s infinite ease-in-out;
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        .playground-actions-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .select-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: var(--text-secondary);
        }
        .select-wrapper label {
          font-weight: 600;
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .code-select {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 6px 10px;
          color: var(--text-primary);
          font-size: 0.82rem;
          outline: none;
          cursor: pointer;
        }
        .engine-select {
          font-size: 0.78rem;
        }
        .run-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          font-weight: 700;
        }
        .run-btn kbd {
          background: rgba(0, 0, 0, 0.25);
          padding: 2px 5px;
          border-radius: 4px;
          font-size: 0.7rem;
          margin-left: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .playground-panes-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          flex: 1;
          min-height: 0;
        }
        .editor-pane, .output-pane {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--bg-card);
        }
        .pane-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-color);
          font-size: 0.82rem;
          font-weight: 600;
        }
        .pane-title {
          color: var(--text-secondary);
          font-family: var(--font-mono);
        }
        .pane-hint {
          color: var(--text-muted);
          font-size: 0.75rem;
        }
        .engine-used-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.3);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.72rem;
          font-weight: 600;
        }
        .pane-time {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--accent-primary);
          font-family: var(--font-mono);
          font-size: 0.75rem;
        }
        .editor-textarea {
          flex: 1;
          width: 100%;
          background: transparent;
          border: none;
          padding: 16px;
          color: var(--text-primary);
          font-family: var(--font-mono);
          font-size: 0.92rem;
          line-height: 1.6;
          resize: none;
          outline: none;
          box-sizing: border-box;
          white-space: pre;
          overflow-wrap: normal;
          overflow-x: auto;
        }
        .output-console-box {
          flex: 1;
          margin: 0;
          padding: 16px;
          font-family: var(--font-mono);
          font-size: 0.88rem;
          line-height: 1.6;
          color: #cbd5e1;
          background: #090d16;
          overflow: auto;
          white-space: pre-wrap;
          word-break: break-word;
        }
        @media (max-width: 900px) {
          .playground-panes-grid {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}

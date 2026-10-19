const express = require('express');
const router = express.Router();
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// Ensure temporary execution directory exists
const TEMP_DIR = path.resolve(__dirname, '../temp_exec');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Pre-configured mock database for SQL queries
function createSqliteDatabase() {
  try {
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(':memory:');
    
    // Seed standard practice tables
    db.exec(`
      CREATE TABLE employees (
        id INTEGER PRIMARY KEY,
        name TEXT,
        department TEXT,
        salary INTEGER,
        hire_date TEXT
      );

      INSERT INTO employees VALUES
        (1, 'Alice Johnson', 'Engineering', 95000, '2022-03-15'),
        (2, 'Bob Smith', 'Engineering', 85000, '2023-01-10'),
        (3, 'Charlie Brown', 'Design', 72000, '2021-08-01'),
        (4, 'Diana Prince', 'Product', 105000, '2020-05-20'),
        (5, 'Ethan Hunt', 'Engineering', 98000, '2022-11-12'),
        (6, 'Fiona Gallagher', 'Marketing', 68000, '2023-04-05');

      CREATE TABLE departments (
        id INTEGER PRIMARY KEY,
        name TEXT,
        budget INTEGER
      );

      INSERT INTO departments VALUES
        (1, 'Engineering', 500000),
        (2, 'Design', 150000),
        (3, 'Product', 200000),
        (4, 'Marketing', 120000);

      CREATE TABLE students (
        id INTEGER PRIMARY KEY,
        name TEXT,
        track TEXT,
        score INTEGER,
        status TEXT
      );

      INSERT INTO students VALUES
        (101, 'Alex Rivera', 'Full-Stack Data Engineering', 94, 'Active'),
        (102, 'Maya Lin', 'Python for AI & ML', 98, 'Active'),
        (103, 'Jordan Lee', 'Database Architecture & SQL', 88, 'Active'),
        (104, 'Samir Patel', 'Full-Stack Data Engineering', 91, 'Completed'),
        (105, 'Chloe Taylor', 'Web Development Masterclass', 85, 'Active');
    `);
    
    return db;
  } catch (err) {
    return null;
  }
}

// @route   GET /api/compiler/status
// @desc    Check available server-side compilers
router.get('/status', (req, res) => {
  execFile('python', ['--version'], (err, stdout, stderr) => {
    const pythonVersion = !err ? (stdout || stderr).trim() : null;
    let sqliteSupported = false;
    try {
      require('node:sqlite');
      sqliteSupported = true;
    } catch {
      sqliteSupported = false;
    }

    res.json({
      success: true,
      compilers: {
        python: {
          available: !err,
          version: pythonVersion || 'Unavailable'
        },
        javascript: {
          available: true,
          version: `Node.js ${process.version}`
        },
        sql: {
          available: sqliteSupported,
          engine: 'SQLite 3 (In-Memory Engine)'
        }
      }
    });
  });
});

// @route   POST /api/compiler/run
// @desc    Execute code securely with timeout
router.post('/run', async (req, res) => {
  const { language = 'python', code = '', input = '' } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ success: false, error: 'No code provided for execution.' });
  }

  const lang = language.toLowerCase();
  const startTime = performance.now();
  const execId = crypto.randomBytes(6).toString('hex');

  // 1. Python Execution
  if (lang === 'python' || lang === 'py') {
    const filePath = path.join(TEMP_DIR, `script_${execId}.py`);
    try {
      await fs.promises.writeFile(filePath, code, 'utf8');

      execFile('python', [filePath], {
        timeout: 10000,
        maxBuffer: 1024 * 1024 * 4 // 4MB buffer
      }, async (error, stdout, stderr) => {
        // Clean up temp file
        try { await fs.promises.unlink(filePath); } catch {}

        const duration = ((performance.now() - startTime) / 1000).toFixed(3);

        if (error) {
          if (error.killed) {
            return res.json({
              success: false,
              error: 'Execution Timed Out (Limit: 10 seconds)',
              stdout: stdout || '',
              stderr: 'Process terminated due to 10-second timeout. Check for infinite loops.',
              duration: `${duration}s`,
              engine: 'Python 3.14 (Server Environment)'
            });
          }

          return res.json({
            success: true,
            stdout: stdout || '',
            stderr: stderr || error.message,
            duration: `${duration}s`,
            engine: 'Python 3.14 (Server Environment)'
          });
        }

        res.json({
          success: true,
          stdout: stdout || '',
          stderr: stderr || '',
          duration: `${duration}s`,
          engine: 'Python 3.14 (Server Environment)'
        });
      });
    } catch (e) {
      try { await fs.promises.unlink(filePath); } catch {}
      res.status(500).json({ success: false, error: 'Internal execution failure: ' + e.message });
    }
    return;
  }

  // 2. JavaScript / Node.js Execution
  if (lang === 'javascript' || lang === 'js' || lang === 'node') {
    const filePath = path.join(TEMP_DIR, `script_${execId}.js`);
    try {
      await fs.promises.writeFile(filePath, code, 'utf8');

      execFile('node', [filePath], {
        timeout: 8000,
        maxBuffer: 1024 * 1024 * 2
      }, async (error, stdout, stderr) => {
        try { await fs.promises.unlink(filePath); } catch {}

        const duration = ((performance.now() - startTime) / 1000).toFixed(3);

        if (error) {
          if (error.killed) {
            return res.json({
              success: false,
              error: 'Execution Timed Out (Limit: 8 seconds)',
              stdout: stdout || '',
              stderr: 'Process terminated due to timeout. Check for infinite loops.',
              duration: `${duration}s`,
              engine: `Node.js ${process.version} (Server Environment)`
            });
          }

          return res.json({
            success: true,
            stdout: stdout || '',
            stderr: stderr || error.message,
            duration: `${duration}s`,
            engine: `Node.js ${process.version} (Server Environment)`
          });
        }

        res.json({
          success: true,
          stdout: stdout || '',
          stderr: stderr || '',
          duration: `${duration}s`,
          engine: `Node.js ${process.version} (Server Environment)`
        });
      });
    } catch (e) {
      try { await fs.promises.unlink(filePath); } catch {}
      res.status(500).json({ success: false, error: 'Internal JS execution failure: ' + e.message });
    }
    return;
  }

  // 3. SQL Execution (SQLite in-memory)
  if (lang === 'sql') {
    try {
      const db = createSqliteDatabase();
      if (!db) {
        return res.status(500).json({ success: false, error: 'SQL engine is not available on this server.' });
      }

      // Split multiple statements if any
      const cleanedCode = code.trim();
      const duration = ((performance.now() - startTime) / 1000).toFixed(3);

      try {
        // If it starts with SELECT, PRAGMA, or EXPLAIN, fetch all rows
        if (/^\s*(SELECT|PRAGMA|EXPLAIN|WITH)/i.test(cleanedCode)) {
          const stmt = db.prepare(cleanedCode);
          const rows = stmt.all();
          
          if (rows.length === 0) {
            return res.json({
              success: true,
              stdout: 'Query executed successfully. Result: 0 rows returned.',
              rows: [],
              duration: `${duration}s`,
              engine: 'SQLite 3 (In-Memory Database)'
            });
          }

          // Format tabular ASCII output for clean terminal viewing
          const columns = Object.keys(rows[0]);
          const colWidths = {};
          columns.forEach(c => colWidths[c] = c.length);
          rows.forEach(r => {
            columns.forEach(c => {
              const valStr = String(r[c] !== null && r[c] !== undefined ? r[c] : 'NULL');
              colWidths[c] = Math.max(colWidths[c], valStr.length);
            });
          });

          const header = columns.map(c => c.padEnd(colWidths[c])).join(' | ');
          const separator = columns.map(c => '-'.repeat(colWidths[c])).join('-+-');
          const bodyLines = rows.map(r => {
            return columns.map(c => {
              const valStr = String(r[c] !== null && r[c] !== undefined ? r[c] : 'NULL');
              return valStr.padEnd(colWidths[c]);
            }).join(' | ');
          });

          const tableOutput = `${header}\n${separator}\n${bodyLines.join('\n')}\n\n(${rows.length} row${rows.length > 1 ? 's' : ''} returned)`;

          return res.json({
            success: true,
            stdout: tableOutput,
            rows,
            duration: `${duration}s`,
            engine: 'SQLite 3 (In-Memory Database)'
          });
        } else {
          // Execute DDL / INSERT / UPDATE / DELETE
          db.exec(cleanedCode);
          return res.json({
            success: true,
            stdout: 'Statement executed successfully. Database state updated.',
            duration: `${duration}s`,
            engine: 'SQLite 3 (In-Memory Database)'
          });
        }
      } catch (sqlErr) {
        return res.json({
          success: true,
          stdout: '',
          stderr: `SQL Error: ${sqlErr.message}`,
          duration: `${duration}s`,
          engine: 'SQLite 3 (In-Memory Database)'
        });
      }
    } catch (e) {
      res.status(500).json({ success: false, error: 'SQL processing failure: ' + e.message });
    }
    return;
  }

  res.status(400).json({ success: false, error: `Language "${language}" is not currently supported.` });
});

module.exports = router;

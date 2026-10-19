import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { PROBLEMS_CATALOG, ALGORITHM_VISUALIZER_DATA } from '../data/problemsData';
import { api } from '../services/api';
import { handleCodeEditorKeyDown } from '../utils/codeEditor';
import {
  ArrowLeft,
  Play,
  Pause,
  Rocket,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Lightbulb,
  Building,
  Award,
  Layers,
  Sliders,
  Copy,
  Check,
  Star,
  Download,
  Maximize2,
  Minimize2,
  MessageSquare,
  History,
  ThumbsUp,
  Send,
  Flame,
  AlertCircle,
  Eye,
  Bot,
  Cpu,
  ShieldCheck,
  ChevronDown,
  ListPlus
} from 'lucide-react';

export default function ProblemSolver() {
  const { slug } = useParams();
  const problem = PROBLEMS_CATALOG.find(p => p.slug === slug) || PROBLEMS_CATALOG[0];

  // Active Tab: 'desc' | 'hints' | 'custom' | 'discuss' | 'editorial' | 'submissions' | 'visualizer' | 'drixbot'
  const [activeTab, setActiveTab] = useState('desc');
  const [lang, setLang] = useState('python');
  const [code, setCode] = useState(problem.starter_code.python);
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [execTime, setExecTime] = useState(null);

  // Quick Code Templates Dropdown
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false);

  // Visualizer State
  const visualizerData = ALGORITHM_VISUALIZER_DATA[problem.slug] || {
    title: `${problem.title}: Step-by-Step Algorithm Execution Trace`,
    inputArray: [1, 2, 3, 4, 5],
    target: 5,
    steps: [
      {
        step: 1,
        activeIndices: [0],
        pointers: { current: 0 },
        explanation: 'Initialize algorithm state. Processing input elements sequentially.',
        status: 'Starting execution...',
        action: 'Inspect element at index 0'
      },
      {
        step: 2,
        activeIndices: [0, 1],
        pointers: { current: 1 },
        explanation: 'Advancing pointer. Comparing current state with problem invariant.',
        status: 'Invariant condition evaluated.',
        action: 'Transition to next state'
      },
      {
        step: 3,
        activeIndices: [0, 1, 2],
        pointers: { current: 2 },
        explanation: 'Terminal condition satisfied with optimal bounds.',
        status: 'Optimal result computed.',
        action: 'Return answer'
      }
    ]
  };

  const [visualizerStep, setVisualizerStep] = useState(0);
  const [isVisualizerPlaying, setIsVisualizerPlaying] = useState(false);

  // Auto-play interval for visualizer
  useEffect(() => {
    let timer = null;
    if (isVisualizerPlaying) {
      timer = setInterval(() => {
        setVisualizerStep(s => {
          if (s >= visualizerData.steps.length - 1) {
            setIsVisualizerPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isVisualizerPlaying, visualizerData.steps.length]);

  // DrixBot AI State
  const [drixBotTool, setDrixBotTool] = useState('complexity'); // 'complexity' | 'edge-cases' | 'intuition'

  // Big-O Complexity Analyzer Logic
  const complexityAnalysis = useMemo(() => {
    const text = code || '';
    const forCount = (text.match(/for\s+/g) || []).length;
    const whileCount = (text.match(/while\s+/g) || []).length;
    const sortUsed = text.includes('.sort') || text.includes('sorted(') || text.includes('std::sort');
    const mapUsed = text.includes('{}') || text.includes('dict(') || text.includes('Map(') || text.includes('unordered_map') || text.includes('HashMap');
    const recursionUsed = text.includes(problem.entry_point) && (text.match(new RegExp(problem.entry_point, 'g')) || []).length > 1;

    let timeComp = 'O(N)';
    let spaceComp = 'O(1)';
    let analysisNotes = [];
    let isOptimal = true;

    if (forCount >= 2 || whileCount >= 2 || (forCount >= 1 && whileCount >= 1)) {
      timeComp = 'O(N²) Quadratic';
      analysisNotes.push('Nested loop structure detected. High risk of Time Limit Exceeded (TLE) on large test inputs (N = 10⁵).');
      isOptimal = false;
    } else if (sortUsed) {
      timeComp = 'O(N log N) Quasilinear';
      analysisNotes.push('Sorting primitive detected (O(N log N)). Suitable for sorted search algorithms.');
    } else if (recursionUsed) {
      timeComp = 'O(2ⁿ) Exponential or O(N) Call Stack';
      analysisNotes.push('Recursive function calls detected. Ensure base case and memoization are used.');
    } else if (forCount === 1 || whileCount === 1) {
      timeComp = 'O(N) Linear Time';
      analysisNotes.push('Single linear loop pass. Optimal time complexity for array traversal.');
    } else {
      timeComp = 'O(1) Constant Time';
      analysisNotes.push('No loop detected. Mathematical or constant-time evaluation.');
    }

    if (mapUsed) {
      spaceComp = 'O(N) Auxiliary Space';
      analysisNotes.push('Hash Map / Dictionary used for O(1) lookups, consuming O(N) memory.');
    } else {
      spaceComp = 'O(1) Auxiliary Space';
      analysisNotes.push('No auxiliary structures detected. Optimal O(1) in-place memory usage.');
    }

    return { timeComp, spaceComp, analysisNotes, isOptimal };
  }, [code, problem.entry_point]);

  // Corner Case Hunter Logic
  const edgeCaseChecklist = useMemo(() => {
    const text = code || '';
    return [
      {
        title: 'Empty Array / Zero Elements (`len == 0`)',
        checked: text.includes('len(') || text.includes('.length') || text.includes('.empty()') || text.includes('.size()'),
        severity: 'Critical Trap',
        recommendation: 'Ensure you handle empty inputs or bounds where array length is 0.'
      },
      {
        title: 'Single-Element Array (`len == 1`)',
        checked: text.includes('== 1') || text.includes('len(') || text.includes('.length'),
        severity: 'High Frequency',
        recommendation: 'Verify behavior when array contains only a single element.'
      },
      {
        title: 'No Solution Found Default Fallback',
        checked: text.includes('[-1]') || text.includes('return []') || text.includes('return {-1}'),
        severity: 'Common Failure',
        recommendation: 'Check that function returns [-1] or default when target cannot be reached.'
      },
      {
        title: 'Duplicate Values / Equal Elements',
        checked: text.includes('==') || text.includes('!=\n') || text.includes('in '),
        severity: 'Subtle Bug',
        recommendation: 'Ensure pointers correctly handle duplicate contiguous values.'
      }
    ];
  }, [code]);

  // Quick Code Template Inserter
  const insertTemplate = (templateType) => {
    setShowTemplatesDropdown(false);
    if (templateType === 'fast_io') {
      if (lang === 'python') {
        setCode(prev => `# DataDrix Fast I/O Template\nimport sys\ninput = sys.stdin.readline\n\n` + prev);
      } else if (lang === 'cpp') {
        setCode(prev => `// DataDrix Fast I/O\nstatic const int __fast_io = []() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    return 0;\n}();\n\n` + prev);
      } else {
        setCode(prev => `// Fast I/O scaffold\n` + prev);
      }
    } else if (templateType === 'two_pointers') {
      if (lang === 'python') {
        setCode(`def solve(arr, target):\n    # DataDrix Two Pointers Pattern O(N)\n    left = 0\n    right = len(arr) - 1\n    while left < right:\n        curr = arr[left] + arr[right]\n        if curr == target:\n            return [left, right]\n        elif curr < target:\n            left += 1\n        else:\n            right -= 1\n    return [-1]\n`);
      } else {
        setCode(`function solve(arr, target) {\n    // DataDrix Two Pointers Pattern O(N)\n    let left = 0, right = arr.length - 1;\n    while (left < right) {\n        let curr = arr[left] + arr[right];\n        if (curr === target) return [left, right];\n        else if (curr < target) left++;\n        else right--;\n    }\n    return [-1];\n}\n`);
      }
    } else if (templateType === 'sliding_window') {
      if (lang === 'python') {
        setCode(`def solve(arr, k):\n    # DataDrix Sliding Window Pattern O(N)\n    left = 0\n    curr_window = 0\n    max_res = 0\n    for right in range(len(arr)):\n        curr_window += arr[right]\n        while curr_window > k and left <= right:\n            curr_window -= arr[left]\n            left += 1\n        max_res = max(max_res, curr_window)\n    return max_res\n`);
      } else {
        setCode(`function solve(arr, k) {\n    // DataDrix Sliding Window Pattern O(N)\n    let left = 0, curr_window = 0, max_res = 0;\n    for (let right = 0; right < arr.length; right++) {\n        curr_window += arr[right];\n        while (curr_window > k && left <= right) {\n            curr_window -= arr[left];\n            left++;\n        }\n        max_res = Math.max(max_res, curr_window);\n    }\n    return max_res;\n}\n`);
      }
    } else if (templateType === 'binary_search') {
      if (lang === 'python') {
        setCode(`def binarySearch(nums, target):\n    # DataDrix Binary Search Pattern O(log N)\n    low = 0\n    high = len(nums) - 1\n    while low <= high:\n        mid = low + (high - low) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n`);
      } else {
        setCode(`function binarySearch(nums, target) {\n    // DataDrix Binary Search Pattern O(log N)\n    let low = 0, high = nums.length - 1;\n    while (low <= high) {\n        let mid = Math.floor(low + (high - low) / 2);\n        if (nums[mid] === target) return mid;\n        else if (nums[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}\n`);
      }
    }
  };
  const [copiedCode, setCopiedCode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Editorial Language Selection
  const [editorialLang, setEditorialLang] = useState('python');

  // Custom Input State
  const [customInput, setCustomInput] = useState(() => {
    return JSON.stringify(problem.test_cases[0]?.args || []);
  });
  const [customResult, setCustomResult] = useState(null);
  const [customRunning, setCustomRunning] = useState(false);

  // Mock Interview Timer
  const [timerSeconds, setTimerSeconds] = useState(45 * 60); // 45 minutes
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Gamified Toast Notification
  const [awardToast, setAwardToast] = useState(null);

  // Solved state
  const [isSolved, setIsSolved] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem('solved_problems') || '[]');
      return list.includes(problem.slug);
    } catch {
      return false;
    }
  });

  // Starred / Bookmarked state
  const [isStarred, setIsStarred] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem('bookmarked_problems') || '[]');
      return list.includes(problem.slug);
    } catch {
      return false;
    }
  });

  const toggleStarred = () => {
    try {
      const list = JSON.parse(localStorage.getItem('bookmarked_problems') || '[]');
      const next = list.includes(problem.slug)
        ? list.filter(s => s !== problem.slug)
        : [...list, problem.slug];
      localStorage.setItem('bookmarked_problems', JSON.stringify(next));
      setIsStarred(!isStarred);
    } catch {}
  };

  // Submissions Log
  const [submissionsList, setSubmissionsList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`submissions_${problem.slug}`) || '[]');
    } catch {
      return [];
    }
  });

  // Discussions State (pre-loaded + user posted)
  const [userComments, setUserComments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`comments_${problem.slug}`) || '[]');
    } catch {
      return [];
    }
  });
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentTitle, setNewCommentTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [upvotesMap, setUpvotesMap] = useState({});

  const pyodideRef = useRef(null);
  const editorTextareaRef = useRef(null);

  // Mock Interview Timer countdown
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Sync starter code and custom input when problem or language changes
  useEffect(() => {
    setCode(problem.starter_code[lang] || '');
    setCustomInput(JSON.stringify(problem.test_cases[0]?.args || []));
    setResults(null);
    setCustomResult(null);
  }, [problem, lang]);

  // Handle switching language
  const handleLangChange = (newLang) => {
    setLang(newLang);
    setCode(problem.starter_code[newLang] || '');
  };

  // Reset to default starter code
  const handleResetCode = () => {
    if (window.confirm('Reset code to default starter template for ' + lang + '?')) {
      setCode(problem.starter_code[lang] || '');
      setResults(null);
    }
  };

  // Download Code File
  const handleDownloadCode = () => {
    const extMap = { python: 'py', javascript: 'js', cpp: 'cpp', java: 'java' };
    const ext = extMap[lang] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${problem.slug}_solution.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Deep comparison helper for test verification
  const deepEquals = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEquals(a[i], b[i])) return false;
      }
      return true;
    }
    if (typeof a === 'object') {
      const ka = Object.keys(a), kb = Object.keys(b);
      if (ka.length !== kb.length) return false;
      for (let k of ka) {
        if (!deepEquals(a[k], b[k])) return false;
      }
      return true;
    }
    return false;
  };

  // Run Test Cases (Sample Run or Complete Submit)
  const handleRun = async (isSubmit) => {
    setIsRunning(true);
    setResults(null);
    const cases = isSubmit ? problem.test_cases : problem.test_cases.filter(c => c.is_sample);
    const t0 = performance.now();
    let passedCount = 0;
    const testResults = [];

    try {
      if (lang === 'cpp' || lang === 'java') {
        // C++ / Java notice for client runner
        alert(`Note: Real-time unit test verification is powered by Python 3 and Node.js. For ${lang === 'cpp' ? 'C++' : 'Java'}, verify your logic against Python/JS or compare with the verified Editorial solution!`);
        setIsRunning(false);
        return;
      }

      if (lang === 'javascript') {
        const fn = new Function(`
          ${code}
          if (typeof ${problem.entry_point} !== 'function') {
            throw new Error('Function "${problem.entry_point}" is not defined.');
          }
          return ${problem.entry_point};
        `)();

        for (let i = 0; i < cases.length; i++) {
          const tc = cases[i];
          const argsClone = JSON.parse(JSON.stringify(tc.args));
          const actual = fn(...argsClone);
          const passed = deepEquals(actual, tc.expected);
          if (passed) passedCount++;
          testResults.push({ index: i + 1, args: tc.args, expected: tc.expected, actual, passed, is_sample: tc.is_sample });
        }
      } else {
        // Python execution: WebAssembly with Server Python 3.14 fallback
        let executedViaWasm = false;

        if (window.loadPyodide) {
          try {
            if (!pyodideRef.current) {
              pyodideRef.current = await window.loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/'
              });
            }
            const py = pyodideRef.current;
            await py.runPythonAsync(code);

            for (let i = 0; i < cases.length; i++) {
              const tc = cases[i];
              py.globals.set('__test_args', tc.args);
              const pyCode = `
import json
args = __test_args.to_py()
res = ${problem.entry_point}(*args)
json.dumps(res)
`;
              const actualJson = await py.runPythonAsync(pyCode);
              const actual = JSON.parse(actualJson);
              const passed = deepEquals(actual, tc.expected);
              if (passed) passedCount++;
              testResults.push({ index: i + 1, args: tc.args, expected: tc.expected, actual, passed, is_sample: tc.is_sample });
            }
            executedViaWasm = true;
          } catch (wasmErr) {
            console.warn('[ProblemSolver] Wasm fallback, executing via Server Python 3.14 Engine:', wasmErr.message);
          }
        }

        // Server-Side Python Fallback (Guaranteed execution via local Python 3.14)
        if (!executedViaWasm) {
          const casesData = JSON.stringify(cases.map(c => ({ args: c.args, expected: c.expected, is_sample: c.is_sample })));
          const runnerScript = `
${code}

import json

cases = ${casesData}
results = []
for i, tc in enumerate(cases):
    try:
        actual = ${problem.entry_point}(*tc["args"])
        results.append({
            "index": i + 1,
            "args": tc["args"],
            "expected": tc["expected"],
            "actual": actual,
            "is_sample": tc["is_sample"],
            "error": None
        })
    except Exception as e:
        results.append({
            "index": i + 1,
            "args": tc["args"],
            "expected": tc["expected"],
            "actual": None,
            "is_sample": tc["is_sample"],
            "error": str(e)
        })

print("===DATADRIX_TESTS_START===")
print(json.dumps(results))
`;
          const serverRes = await api.executeCode({ language: 'python', code: runnerScript });
          if (serverRes.stderr && !serverRes.stdout?.includes('===DATADRIX_TESTS_START===')) {
            throw new Error(serverRes.stderr);
          }

          const rawOutput = serverRes.stdout || '';
          const marker = '===DATADRIX_TESTS_START===';
          const markerIdx = rawOutput.indexOf(marker);
          if (markerIdx === -1) {
            throw new Error(serverRes.stderr || 'Python execution did not produce expected test results.');
          }

          const jsonStr = rawOutput.substring(markerIdx + marker.length).trim();
          const parsedResults = JSON.parse(jsonStr);

          for (const item of parsedResults) {
            if (item.error) {
              testResults.push({
                index: item.index,
                args: item.args,
                expected: item.expected,
                actual: `Runtime Error: ${item.error}`,
                passed: false,
                is_sample: item.is_sample
              });
            } else {
              const passed = deepEquals(item.actual, item.expected);
              if (passed) passedCount++;
              testResults.push({
                index: item.index,
                args: item.args,
                expected: item.expected,
                actual: item.actual,
                passed,
                is_sample: item.is_sample
              });
            }
          }
        }
      }

      const t1 = performance.now();
      const elapsed = ((t1 - t0) / 1000).toFixed(3);
      setExecTime(elapsed);
      const allPassed = passedCount === cases.length;

      setResults({
        allPassed,
        isSubmit,
        passedCount,
        totalCount: cases.length,
        testCases: testResults
      });

      // Save to Submissions History
      const newSubmission = {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        date: new Date().toLocaleDateString(),
        verdict: allPassed ? (isSubmit ? 'All Tests Passed' : 'Sample Tests Passed') : 'Wrong Answer',
        passedCount,
        totalCount: cases.length,
        allPassed,
        isSubmit,
        language: lang === 'python' ? 'Python 3.14' : 'JavaScript (V8)',
        runtime: `${elapsed}s`
      };

      setSubmissionsList(prev => {
        const updated = [newSubmission, ...prev.slice(0, 19)];
        localStorage.setItem(`submissions_${problem.slug}`, JSON.stringify(updated));
        return updated;
      });

      // DataDrix Confetti & Points Reward
      if (isSubmit && allPassed) {
        setIsSolved(true);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });

        const earnedPoints = problem.points || 5;
        setAwardToast({
          points: earnedPoints,
          title: `Challenge Solved! +${earnedPoints} Coding Points`
        });
        setTimeout(() => setAwardToast(null), 5000);

        try {
          const cur = JSON.parse(localStorage.getItem('solved_problems') || '[]');
          if (!cur.includes(problem.slug)) {
            cur.push(problem.slug);
            localStorage.setItem('solved_problems', JSON.stringify(cur));
          }
          const prevStreak = parseInt(localStorage.getItem('coding_streak') || '3', 10);
          localStorage.setItem('coding_streak', String(prevStreak + 1));
        } catch {}
      }
    } catch (err) {
      setResults({
        error: err.message,
        allPassed: false
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Run Custom Test Input
  const handleRunCustom = async () => {
    setCustomRunning(true);
    setCustomResult(null);
    const t0 = performance.now();

    try {
      let parsedArgs;
      try {
        parsedArgs = JSON.parse(customInput);
        if (!Array.isArray(parsedArgs)) {
          parsedArgs = [parsedArgs];
        }
      } catch (_e) {
        throw new Error('Custom input must be a valid JSON array of arguments (e.g. [[1, 2, 3], 6]).');
      }

      if (lang === 'javascript') {
        const fn = new Function(`
          ${code}
          if (typeof ${problem.entry_point} !== 'function') {
            throw new Error('Function "${problem.entry_point}" is not defined.');
          }
          return ${problem.entry_point};
        `)();

        const actual = fn(...parsedArgs);
        const elapsed = (performance.now() - t0).toFixed(1);
        setCustomResult({
          success: true,
          actual: JSON.stringify(actual, null, 2),
          elapsed: `${elapsed}ms`
        });
      } else {
        const customScript = `
${code}

import json

args = ${JSON.stringify(parsedArgs)}
try:
    res = ${problem.entry_point}(*args)
    print("===CUSTOM_RESULT_START===")
    print(json.dumps(res))
except Exception as e:
    print("===CUSTOM_ERROR_START===")
    print(str(e))
`;
        const res = await api.executeCode({ language: 'python', code: customScript });
        const raw = res.stdout || '';

        if (raw.includes('===CUSTOM_RESULT_START===')) {
          const val = raw.split('===CUSTOM_RESULT_START===')[1].trim();
          setCustomResult({
            success: true,
            actual: val,
            elapsed: res.duration
          });
        } else if (raw.includes('===CUSTOM_ERROR_START===')) {
          const errStr = raw.split('===CUSTOM_ERROR_START===')[1].trim();
          setCustomResult({
            success: false,
            error: errStr,
            elapsed: res.duration
          });
        } else if (res.stderr) {
          setCustomResult({
            success: false,
            error: res.stderr,
            elapsed: res.duration
          });
        } else {
          setCustomResult({
            success: true,
            actual: raw.trim(),
            elapsed: res.duration
          });
        }
      }
    } catch (err) {
      setCustomResult({
        success: false,
        error: err.message
      });
    } finally {
      setCustomRunning(false);
    }
  };

  // Post a Community Comment
  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment = {
      id: 'user-c-' + Date.now(),
      author: newCommentName.trim() || 'DataDrix Coder',
      avatar: (newCommentName.trim() || 'DC').slice(0, 2).toUpperCase(),
      role: 'Community Developer',
      time: 'Just now',
      upvotes: 1,
      title: newCommentTitle.trim() || 'My Solution Note',
      content: newCommentText.trim()
    };

    const nextComments = [newComment, ...userComments];
    setUserComments(nextComments);
    localStorage.setItem(`comments_${problem.slug}`, JSON.stringify(nextComments));
    setNewCommentTitle('');
    setNewCommentText('');
  };

  const handleUpvote = (id) => {
    setUpvotesMap(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const copyStarterCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Load Editorial code directly into editor
  const loadEditorialCode = () => {
    const solKey = `${editorialLang}_solution`;
    const solCode = problem.editorial[solKey];
    if (solCode) {
      setLang(editorialLang);
      setCode(solCode);
      alert(`Loaded optimal ${editorialLang.toUpperCase()} editorial solution into editor!`);
    }
  };

  return (
    <div className={`datadrix-solver-page ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Gamified Celebration Toast */}
      {awardToast && (
        <div className="award-toast glass-panel">
          <Award size={24} color="#fbbf24" />
          <div className="award-toast-content">
            <strong>{awardToast.title}</strong>
            <span>Streak updated! Keep the momentum alive.</span>
          </div>
          <Flame size={20} color="#f97316" />
        </div>
      )}

      {/* Top Breadcrumb & Quick Controls */}
      <div className="solver-header-bar glass-panel">
        <div className="solver-nav-left">
          <Link to="/practice" className="back-link">
            <ArrowLeft size={16} />
            <span>Problem Arena</span>
          </Link>
          <span className="divider">/</span>
          <span className="problem-current-title">{problem.title}</span>
          <span className={`diff-pill diff-${problem.difficulty.toLowerCase()}`}>
            {problem.difficulty}
          </span>
          <span className="points-badge">+{problem.points} Pts</span>
          {isSolved && (
            <span className="solved-badge">
              <CheckCircle2 size={13} /> Solved
            </span>
          )}
        </div>

        <div className="solver-nav-right">
          {/* Mock Interview Timer */}
          <div className={`interview-timer-pill ${timerSeconds < 300 ? 'timer-danger' : ''}`}>
            <Clock size={15} />
            <span className="timer-val">{formatTimer(timerSeconds)}</span>
            <button
              type="button"
              className="timer-toggle-btn"
              onClick={() => setIsTimerActive(!isTimerActive)}
              title={isTimerActive ? "Pause Timer" : "Start Mock Interview Timer"}
            >
              {isTimerActive ? 'Pause' : 'Start'}
            </button>
            <button
              type="button"
              className="timer-reset-btn"
              onClick={() => { setIsTimerActive(false); setTimerSeconds(45 * 60); }}
              title="Reset Timer (45m)"
            >
              <RotateCcw size={12} />
            </button>
          </div>

          {/* Star / Bookmark Toggle */}
          <button
            type="button"
            className="action-icon-btn"
            onClick={toggleStarred}
            title={isStarred ? "Remove Bookmark" : "Bookmark for Revision"}
          >
            <Star size={16} fill={isStarred ? "#fbbf24" : "none"} color={isStarred ? "#fbbf24" : "var(--text-muted)"} />
          </button>

          {/* Download Solution */}
          <button
            type="button"
            className="action-icon-btn"
            onClick={handleDownloadCode}
            title="Download Code File"
          >
            <Download size={16} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            className="action-icon-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Focus Mode"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Tabs vs Right Code Editor */}
      <div className="solver-workspace">
        {/* Left Side: Tabs Navigation & Dynamic Panels */}
        <div className="problem-info-pane glass-panel">
          <div className="pane-tabs-header">
            <button
              type="button"
              className={`pane-tab ${activeTab === 'desc' ? 'active' : ''}`}
              onClick={() => setActiveTab('desc')}
            >
              Problem Statement
            </button>
            <button
              type="button"
              className={`pane-tab ${activeTab === 'hints' ? 'active' : ''}`}
              onClick={() => setActiveTab('hints')}
            >
              <Lightbulb size={13} />
              <span>Hints ({problem.hints?.length || 0})</span>
            </button>
            <button
              type="button"
              className={`pane-tab ${activeTab === 'custom' ? 'active' : ''}`}
              onClick={() => setActiveTab('custom')}
            >
              <Sliders size={13} />
              <span>Custom Input</span>
            </button>
            <button
              type="button"
              className={`pane-tab ${activeTab === 'discuss' ? 'active' : ''}`}
              onClick={() => setActiveTab('discuss')}
            >
              <MessageSquare size={13} />
              <span>Discuss</span>
            </button>
            <button
              type="button"
              className={`pane-tab ${activeTab === 'editorial' ? 'active' : ''}`}
              onClick={() => setActiveTab('editorial')}
            >
              <Layers size={13} />
              <span>Editorial</span>
            </button>
            <button
              type="button"
              className={`pane-tab ${activeTab === 'submissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('submissions')}
            >
              <History size={13} />
              <span>Submissions ({submissionsList.length})</span>
            </button>
            <button
              type="button"
              className={`pane-tab ${activeTab === 'visualizer' ? 'active' : ''}`}
              onClick={() => setActiveTab('visualizer')}
            >
              <Eye size={13} color="#34d399" />
              <span>Visualizer</span>
            </button>
            <button
              type="button"
              className={`pane-tab ${activeTab === 'drixbot' ? 'active' : ''}`}
              onClick={() => setActiveTab('drixbot')}
            >
              <Bot size={13} color="#a78bfa" />
              <span>DrixBot AI</span>
            </button>
          </div>

          <div className="pane-scroll-content">
            {/* TAB 1: PROBLEM STATEMENT */}
            {activeTab === 'desc' && (
              <div className="desc-tab-body">
                <h2 className="prob-title">{problem.title}</h2>
                <div className="prob-meta-row">
                  <span className="meta-item">
                    <strong>Topic:</strong> {problem.category}
                  </span>
                  <span className="meta-item">
                    <strong>Time:</strong> {problem.time_complexity}
                  </span>
                  <span className="meta-item">
                    <strong>Space:</strong> {problem.space_complexity}
                  </span>
                  <span className="meta-item">
                    <strong>Accuracy:</strong> {problem.accuracy}
                  </span>
                </div>

                <div className="company-tags-box">
                  <span className="companies-label">
                    <Building size={13} /> Asked In:
                  </span>
                  <div className="company-pills-row">
                    {problem.companies.map(c => (
                      <span key={c} className="company-pill">{c}</span>
                    ))}
                  </div>
                </div>

                <div className="statement-section">
                  <p className="statement-text">{problem.description}</p>
                </div>

                <div className="examples-section">
                  <h3>Examples</h3>
                  {problem.examples.map((ex, idx) => (
                    <div key={idx} className="example-card">
                      <div className="example-header">Example {idx + 1}:</div>
                      <div className="example-line">
                        <strong>Input:</strong> <code>{ex.input}</code>
                      </div>
                      <div className="example-line">
                        <strong>Output:</strong> <code>{ex.output}</code>
                      </div>
                      {ex.explanation && (
                        <div className="example-line explanation">
                          <strong>Explanation:</strong> {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="constraints-section">
                  <h3>Constraints</h3>
                  <ul className="constraints-list">
                    {problem.constraints.map((c, i) => (
                      <li key={i}><code>{c}</code></li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 2: PROGRESSIVE HINTS */}
            {activeTab === 'hints' && (
              <div className="hints-tab-body">
                <div className="hints-intro">
                  <Lightbulb size={20} color="#fbbf24" />
                  <div>
                    <h4>Progressive Hints</h4>
                    <p>Read hints sequentially if you are stuck before consulting the full editorial.</p>
                  </div>
                </div>

                <div className="hints-list">
                  {problem.hints.map((hint, idx) => (
                    <div key={idx} className="hint-card">
                      <div className="hint-title">
                        <span className="hint-num">Hint {idx + 1}</span>
                      </div>
                      <p className="hint-text">{hint}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: CUSTOM INPUT RUNNER */}
            {activeTab === 'custom' && (
              <div className="custom-tab-body">
                <div className="custom-intro">
                  <Sliders size={18} color="#818cf8" />
                  <div>
                    <h4>Custom Input Sandbox</h4>
                    <p>Test arbitrary arguments with your active code in real time.</p>
                  </div>
                </div>

                <div className="custom-input-box">
                  <label className="input-label">Function Arguments (JSON Array):</label>
                  <textarea
                    rows={4}
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    className="custom-textarea"
                    placeholder="e.g. [[1, 2, 3, 7, 5], 12]"
                  />
                  <small className="input-help">
                    Must be valid JSON array of arguments matching <code>{problem.entry_point}(...)</code>.
                  </small>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-sm run-custom-btn"
                  onClick={handleRunCustom}
                  disabled={customRunning}
                >
                  <Play size={14} />
                  <span>{customRunning ? 'Executing...' : 'Run Custom Test'}</span>
                </button>

                {customResult && (
                  <div className={`custom-result-card ${customResult.success ? 'res-success' : 'res-error'}`}>
                    <div className="res-header">
                      <span>Execution Result</span>
                      {customResult.elapsed && <small>Runtime: {customResult.elapsed}</small>}
                    </div>
                    {customResult.success ? (
                      <pre className="res-output">{customResult.actual}</pre>
                    ) : (
                      <div className="res-error-text">
                        <AlertCircle size={15} />
                        <span>{customResult.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: COMMUNITY DISCUSS */}
            {activeTab === 'discuss' && (
              <div className="discuss-tab-body">
                <div className="discuss-header-row">
                  <div>
                    <h4>Community Discussions</h4>
                    <p>Techniques, edge cases, and insights shared by practicing engineers.</p>
                  </div>
                </div>

                {/* Post New Comment */}
                <form onSubmit={handlePostComment} className="new-comment-form glass-panel">
                  <div className="form-row-2">
                    <input
                      type="text"
                      placeholder="Your Name (e.g. Rahul S.)"
                      value={newCommentName}
                      onChange={e => setNewCommentName(e.target.value)}
                      className="comment-input"
                    />
                    <input
                      type="text"
                      placeholder="Discussion Title / Technique"
                      value={newCommentTitle}
                      onChange={e => setNewCommentTitle(e.target.value)}
                      className="comment-input"
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Share your approach, time-complexity intuition, or edge cases..."
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    className="comment-textarea"
                  />
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary btn-sm">
                      <Send size={13} />
                      <span>Post to Community</span>
                    </button>
                  </div>
                </form>

                {/* Discussions Feed */}
                <div className="comments-feed">
                  {[...userComments, ...(problem.discussions || [])].map(item => {
                    const extraUpvotes = upvotesMap[item.id] || 0;
                    return (
                      <div key={item.id} className="comment-card glass-panel">
                        <div className="comment-header">
                          <div className="comment-author-wrap">
                            <div className="author-avatar">{item.avatar}</div>
                            <div>
                              <div className="author-name">{item.author}</div>
                              <div className="author-sub">
                                <span className="author-role">{item.role}</span>
                                <span>• {item.time}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="upvote-btn"
                            onClick={() => handleUpvote(item.id)}
                            title="Upvote discussion"
                          >
                            <ThumbsUp size={13} />
                            <span>{item.upvotes + extraUpvotes}</span>
                          </button>
                        </div>

                        <h5 className="comment-title">{item.title}</h5>
                        <p className="comment-body">{item.content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: EDITORIAL & OPTIMAL SOLUTIONS */}
            {activeTab === 'editorial' && (
              <div className="editorial-tab-body">
                <div className="editorial-header">
                  <Layers size={18} color="#10b981" />
                  <div>
                    <h4>Official DataDrix Editorial</h4>
                    <span className="approach-tag">Approach: {problem.editorial.approach}</span>
                  </div>
                </div>

                <div className="editorial-desc">
                  <p>{problem.editorial.explanation}</p>
                </div>

                <div className="editorial-code-section">
                  <div className="editorial-lang-tabs">
                    {['python', 'javascript', 'cpp', 'java'].map(l => (
                      <button
                        key={l}
                        type="button"
                        className={`ed-lang-btn ${editorialLang === l ? 'active' : ''}`}
                        onClick={() => setEditorialLang(l)}
                      >
                        {l === 'python' ? 'Python 3' : l === 'javascript' ? 'JavaScript' : l === 'cpp' ? 'C++ 17' : 'Java 17'}
                      </button>
                    ))}
                  </div>

                  <div className="editorial-code-box">
                    <pre className="editorial-pre">
                      {problem.editorial[`${editorialLang}_solution`] || `// Solution available in Python and JavaScript.`}
                    </pre>

                    <div className="editorial-code-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          const sol = problem.editorial[`${editorialLang}_solution`];
                          if (sol) {
                            navigator.clipboard.writeText(sol);
                            alert('Editorial solution copied to clipboard!');
                          }
                        }}
                      >
                        <Copy size={13} />
                        <span>Copy Code</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={loadEditorialCode}
                      >
                        <Rocket size={13} />
                        <span>Load Solution into Editor</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SUBMISSIONS LOG */}
            {activeTab === 'submissions' && (
              <div className="submissions-tab-body">
                <div className="submissions-header">
                  <History size={18} color="#818cf8" />
                  <div>
                    <h4>Submissions History</h4>
                    <p>Live execution log of all attempts submitted for this problem.</p>
                  </div>
                </div>

                {submissionsList.length === 0 ? (
                  <div className="empty-submissions">
                    <p>No attempts recorded yet. Run tests or submit to log your first submission!</p>
                  </div>
                ) : (
                  <div className="submissions-table">
                    <div className="sub-header-row">
                      <span>Verdict</span>
                      <span>Language</span>
                      <span>Passed</span>
                      <span>Runtime</span>
                      <span>Time</span>
                    </div>
                    {submissionsList.map((sub, i) => (
                      <div key={sub.id || i} className="sub-row">
                        <span className={`sub-verdict ${sub.allPassed ? 'verdict-pass' : 'verdict-fail'}`}>
                          {sub.allPassed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          <span>{sub.verdict}</span>
                        </span>
                        <span className="sub-lang">{sub.language}</span>
                        <span className="sub-count">{sub.passedCount} / {sub.totalCount}</span>
                        <span className="sub-time">{sub.runtime}</span>
                        <span className="sub-timestamp">{sub.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: ALGORITHMIC STEP-BY-STEP VISUALIZER */}
            {activeTab === 'visualizer' && (
              <div className="visualizer-tab-body">
                <div className="visualizer-header">
                  <div className="vis-title-row">
                    <div className="vis-icon-wrap">
                      <Eye size={20} color="#34d399" />
                    </div>
                    <div>
                      <h3 className="vis-heading">{visualizerData.title}</h3>
                      <p className="vis-sub">
                        Step-by-step visual execution trace showing pointer transitions, array updates, and invariant validations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Array Display */}
                <div className="visualizer-canvas glass-panel">
                  <div className="canvas-elements-row">
                    {visualizerData.inputArray.map((val, idx) => {
                      const curStepObj = visualizerData.steps[visualizerStep] || visualizerData.steps[0];
                      const isActive = curStepObj.activeIndices?.includes(idx);
                      const isLeft = curStepObj.pointers?.left === idx;
                      const isRight = curStepObj.pointers?.right === idx;
                      const isMid = curStepObj.pointers?.mid === idx;
                      const isCurrent = curStepObj.pointers?.current === idx;

                      return (
                        <div key={idx} className="array-cell-col">
                          <span className="cell-index-label">idx {idx}</span>
                          <div className={`array-cell-box ${isActive ? 'active-cell' : ''} ${isLeft ? 'left-ptr-cell' : ''} ${isRight ? 'right-ptr-cell' : ''}`}>
                            <span className="cell-value">{val}</span>
                          </div>

                          {/* Pointer Badges */}
                          <div className="pointers-stack">
                            {isLeft && <span className="ptr-pill ptr-left">left</span>}
                            {isRight && <span className="ptr-pill ptr-right">right</span>}
                            {isMid && <span className="ptr-pill ptr-mid">mid</span>}
                            {isCurrent && !isLeft && !isRight && <span className="ptr-pill ptr-curr">curr</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Variables HUD Bar */}
                  {(() => {
                    const curStepObj = visualizerData.steps[visualizerStep] || visualizerData.steps[0];
                    return (
                      <div className="visualizer-hud-row">
                        <div className="vis-hud-item">
                          <span className="vis-hud-lbl">Target:</span>
                          <span className="vis-hud-val" style={{ color: '#f59e0b' }}>{visualizerData.target}</span>
                        </div>
                        {curStepObj.currentSum !== undefined && (
                          <div className="vis-hud-item">
                            <span className="vis-hud-lbl">Current Window Sum:</span>
                            <span className="vis-hud-val" style={{ color: '#38bdf8' }}>{curStepObj.currentSum}</span>
                          </div>
                        )}
                        {curStepObj.waterTrapped !== undefined && (
                          <div className="vis-hud-item">
                            <span className="vis-hud-lbl">Accumulated Water:</span>
                            <span className="vis-hud-val" style={{ color: '#34d399' }}>{curStepObj.waterTrapped} units</span>
                          </div>
                        )}
                        {curStepObj.state?.complement !== undefined && (
                          <div className="vis-hud-item">
                            <span className="vis-hud-lbl">Complement Needed:</span>
                            <span className="vis-hud-val" style={{ color: '#a78bfa' }}>{curStepObj.state.complement}</span>
                          </div>
                        )}
                        {curStepObj.state?.map && Object.keys(curStepObj.state.map).length > 0 && (
                          <div className="vis-hud-item">
                            <span className="vis-hud-lbl">Hash Map:</span>
                            <span className="vis-hud-val" style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>
                              {JSON.stringify(curStepObj.state.map)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Step Narrative & Decision Card */}
                {(() => {
                  const curStepObj = visualizerData.steps[visualizerStep] || visualizerData.steps[0];
                  return (
                    <div className="step-narrative-card glass-panel">
                      <div className="narrative-top-row">
                        <span className="step-counter-pill">
                          Step {visualizerStep + 1} of {visualizerData.steps.length}
                        </span>
                        <span className="step-status-tag">{curStepObj.status}</span>
                      </div>
                      <p className="step-explanation-text">{curStepObj.explanation}</p>
                      <div className="step-action-row">
                        <span className="action-label">Action Performed:</span>
                        <code className="action-code-tag">{curStepObj.action}</code>
                      </div>
                    </div>
                  );
                })()}

                {/* Playback Controls */}
                <div className="visualizer-controls-bar glass-panel">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setIsVisualizerPlaying(false); setVisualizerStep(0); }}
                    title="Reset to First Step"
                  >
                    <RotateCcw size={14} />
                    <span>Reset</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setIsVisualizerPlaying(false); setVisualizerStep(s => Math.max(0, s - 1)); }}
                    disabled={visualizerStep === 0}
                  >
                    <span>◀ Prev Step</span>
                  </button>

                  <button
                    type="button"
                    className={`btn ${isVisualizerPlaying ? 'btn-secondary' : 'btn-primary'} btn-sm play-btn`}
                    onClick={() => setIsVisualizerPlaying(!isVisualizerPlaying)}
                  >
                    {isVisualizerPlaying ? <Pause size={14} /> : <Play size={14} />}
                    <span>{isVisualizerPlaying ? 'Pause' : 'Auto Play'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setIsVisualizerPlaying(false); setVisualizerStep(s => Math.min(visualizerData.steps.length - 1, s + 1)); }}
                    disabled={visualizerStep >= visualizerData.steps.length - 1}
                  >
                    <span>Next Step ▶</span>
                  </button>

                  <div className="vis-slider-wrap">
                    <input
                      type="range"
                      min={0}
                      max={visualizerData.steps.length - 1}
                      value={visualizerStep}
                      onChange={e => { setIsVisualizerPlaying(false); setVisualizerStep(parseInt(e.target.value, 10)); }}
                      className="vis-range-slider"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: DRIXBOT AI CODE ASSISTANT */}
            {activeTab === 'drixbot' && (
              <div className="drixbot-tab-body">
                <div className="drixbot-hero glass-panel">
                  <div className="drixbot-avatar">
                    <Bot size={28} color="#a78bfa" />
                  </div>
                  <div className="drixbot-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 className="drixbot-title">DrixBot AI Copilot</h3>
                      <span className="drixbot-badge">Real-time AST Analyzer</span>
                    </div>
                    <p className="drixbot-sub">
                      Intelligent in-solver assistant analyzing your active code for Big-O bottlenecks, edge-case traps, and algorithmic intuition.
                    </p>
                  </div>
                </div>

                {/* Sub-tool Selector */}
                <div className="drixbot-subtools">
                  <button
                    type="button"
                    className={`bot-tool-btn ${drixBotTool === 'complexity' ? 'active' : ''}`}
                    onClick={() => setDrixBotTool('complexity')}
                  >
                    <Cpu size={14} />
                    <span>Big-O Complexity</span>
                  </button>
                  <button
                    type="button"
                    className={`bot-tool-btn ${drixBotTool === 'edge-cases' ? 'active' : ''}`}
                    onClick={() => setDrixBotTool('edge-cases')}
                  >
                    <ShieldCheck size={14} />
                    <span>Corner Case Hunter</span>
                  </button>
                  <button
                    type="button"
                    className={`bot-tool-btn ${drixBotTool === 'intuition' ? 'active' : ''}`}
                    onClick={() => setDrixBotTool('intuition')}
                  >
                    <Lightbulb size={14} />
                    <span>Approach Intuition</span>
                  </button>
                </div>

                {/* Sub-Tool 1: Big-O Analyzer */}
                {drixBotTool === 'complexity' && (
                  <div className="bot-analysis-card glass-panel">
                    <div className="complexity-grid">
                      <div className="comp-metric-box">
                        <span className="comp-metric-lbl">Estimated Time Complexity</span>
                        <span className={`comp-metric-val ${complexityAnalysis.isOptimal ? 'text-success' : 'text-warning'}`}>
                          {complexityAnalysis.timeComp}
                        </span>
                        <span className="comp-metric-sub">Target for problem: {problem.time_complexity}</span>
                      </div>
                      <div className="comp-metric-box">
                        <span className="comp-metric-lbl">Auxiliary Space Complexity</span>
                        <span className="comp-metric-val text-info">
                          {complexityAnalysis.spaceComp}
                        </span>
                        <span className="comp-metric-sub">Target for problem: {problem.space_complexity}</span>
                      </div>
                    </div>

                    <div className="comp-findings-box">
                      <h4 className="findings-title">Static AST Findings:</h4>
                      <ul className="findings-list">
                        {complexityAnalysis.analysisNotes.map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="comp-tip-box">
                      <strong>💡 Performance Recommendation:</strong>{' '}
                      {complexityAnalysis.isOptimal
                        ? 'Your algorithm adheres to linear time bounds. Test case execution will comfortably complete well under 1.0s.'
                        : 'Notice the quadratic nested iteration. Replace the inner lookup with a Hash Map or Two Pointers to drop from O(N²) to O(N).'}
                    </div>
                  </div>
                )}

                {/* Sub-Tool 2: Corner Case Hunter */}
                {drixBotTool === 'edge-cases' && (
                  <div className="bot-analysis-card glass-panel">
                    <div className="edge-cases-header">
                      <h4>Interview Edge-Case Checklist</h4>
                      <p>DataDrix test benches rigorously evaluate unusual inputs and boundary conditions.</p>
                    </div>

                    <div className="edge-cases-list">
                      {edgeCaseChecklist.map((ec, idx) => (
                        <div key={idx} className="edge-case-item">
                          <div className="ec-status-icon">
                            {ec.checked ? <CheckCircle2 size={18} color="#34d399" /> : <AlertCircle size={18} color="#f59e0b" />}
                          </div>
                          <div className="ec-content">
                            <div className="ec-title-row">
                              <span className="ec-title">{ec.title}</span>
                              <span className={`ec-tag ${ec.checked ? 'tag-safe' : 'tag-alert'}`}>
                                {ec.checked ? 'Guarded in Code' : ec.severity}
                              </span>
                            </div>
                            <p className="ec-rec">{ec.recommendation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Tool 3: Approach Intuition */}
                {drixBotTool === 'intuition' && (
                  <div className="bot-analysis-card glass-panel">
                    <div className="intuition-steps-wrap">
                      <div className="intuition-step">
                        <div className="step-num">1</div>
                        <div className="step-text">
                          <h5>1. Brute Force Exploration</h5>
                          <p>
                            Examine all pairs / subarrays with nested loops. While intuitive, this approach runs in O(N²) or O(2ⁿ) and exceeds the 1-second time limit on N = 10⁵.
                          </p>
                        </div>
                      </div>

                      <div className="intuition-step">
                        <div className="step-num">2</div>
                        <div className="step-text">
                          <h5>2. Pattern Recognition ({problem.category})</h5>
                          <p>
                            Observe invariants: if the array has positive monotonic values, expanding a window increases the sum while shrinking decreases it. This unlocks the linear O(N) pattern.
                          </p>
                        </div>
                      </div>

                      <div className="intuition-step">
                        <div className="step-num">3</div>
                        <div className="step-text">
                          <h5>3. Optimal In-Place Memory</h5>
                          <p>
                            Eliminate auxiliary storage by maintaining two cursor index variables (left and right), achieving O(1) auxiliary space and optimal O(N) single-pass speed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Code Editor & Test Case Evaluation Console */}
        <div className="code-editor-pane glass-panel">
          {/* Editor Header Toolbar */}
          <div className="editor-toolbar">
            <div className="toolbar-left">
              <span className="tool-label">Language:</span>
              <div className="lang-selector-group">
                <button
                  type="button"
                  className={`lang-btn ${lang === 'python' ? 'active' : ''}`}
                  onClick={() => handleLangChange('python')}
                >
                  Python 3.14
                </button>
                <button
                  type="button"
                  className={`lang-btn ${lang === 'javascript' ? 'active' : ''}`}
                  onClick={() => handleLangChange('javascript')}
                >
                  JavaScript
                </button>
                <button
                  type="button"
                  className={`lang-btn ${lang === 'cpp' ? 'active' : ''}`}
                  onClick={() => handleLangChange('cpp')}
                >
                  C++ 17
                </button>
                <button
                  type="button"
                  className={`lang-btn ${lang === 'java' ? 'active' : ''}`}
                  onClick={() => handleLangChange('java')}
                >
                  Java 17
                </button>
              </div>
            </div>

            <div className="toolbar-right">
              {/* Quick Patterns & Boilerplate Dropdown */}
              <div className="template-dropdown-wrap">
                <button
                  type="button"
                  className="tool-action-btn"
                  onClick={() => setShowTemplatesDropdown(!showTemplatesDropdown)}
                  title="Insert Algorithmic Scaffold Template"
                >
                  <ListPlus size={14} color="#818cf8" />
                  <span>Templates</span>
                  <ChevronDown size={12} />
                </button>
                {showTemplatesDropdown && (
                  <div className="template-dropdown-menu glass-panel">
                    <button type="button" onClick={() => insertTemplate('fast_io')}>
                      ⚡ Fast I/O Boilerplate
                    </button>
                    <button type="button" onClick={() => insertTemplate('two_pointers')}>
                      👉 Two Pointers O(N) Pattern
                    </button>
                    <button type="button" onClick={() => insertTemplate('sliding_window')}>
                      🪟 Sliding Window Dynamic Range
                    </button>
                    <button type="button" onClick={() => insertTemplate('binary_search')}>
                      🔍 Binary Search O(log N)
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="tool-action-btn"
                onClick={handleResetCode}
                title="Reset starter template"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>

              <button
                type="button"
                className="tool-action-btn"
                onClick={copyStarterCode}
                title="Copy Code"
              >
                {copiedCode ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Code Editor Textarea with Self-Indentation */}
          <div className="code-editor-wrap">
            <textarea
              ref={editorTextareaRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => handleCodeEditorKeyDown(e, setCode, () => handleRun(false))}
              className="code-textarea"
              placeholder={`Write your ${lang} solution here...`}
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
            />
          </div>

          {/* Bottom Execution Bar */}
          <div className="editor-footer-bar">
            <div className="shortcuts-hint">
              <span>Shortcuts: <code>Ctrl + Enter</code> to run • <code>Tab</code> indents 4 spaces</span>
            </div>

            <div className="action-buttons-group">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleRun(false)}
                disabled={isRunning}
              >
                <Play size={14} />
                <span>{isRunning ? 'Running...' : 'Run Sample Tests'}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm submit-btn"
                onClick={() => handleRun(true)}
                disabled={isRunning}
              >
                <Rocket size={14} />
                <span>{isRunning ? 'Evaluating...' : 'Submit Solution'}</span>
              </button>
            </div>
          </div>

          {/* Results Console */}
          {results && (
            <div className={`results-drawer ${results.allPassed ? 'all-passed' : 'has-failures'}`}>
              <div className="drawer-header">
                <div className="drawer-title">
                  {results.allPassed ? (
                    <span className="verdict-tag tag-success">
                      <CheckCircle2 size={16} />
                      {results.isSubmit ? 'ACCEPTED - ALL TEST CASES PASSED' : 'SAMPLE TESTS PASSED'}
                    </span>
                  ) : (
                    <span className="verdict-tag tag-failed">
                      <XCircle size={16} />
                      {results.error ? 'RUNTIME / COMPILATION ERROR' : 'FAILED TEST CASES'}
                    </span>
                  )}
                  {execTime && <span className="time-badge">Runtime: {execTime}s</span>}
                </div>

                <span className="score-summary">
                  Passed: {results.passedCount || 0} / {results.totalCount || 0}
                </span>
              </div>

              {results.error ? (
                <div className="error-body">
                  <pre>{results.error}</pre>
                </div>
              ) : (
                <div className="test-cases-list">
                  {results.testCases?.map(tc => (
                    <div key={tc.index} className={`testcase-row ${tc.passed ? 'tc-pass' : 'tc-fail'}`}>
                      <div className="tc-header">
                        <span className="tc-index">
                          {tc.passed ? <CheckCircle2 size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
                          Case {tc.index} {tc.is_sample && <small>(Sample)</small>}
                        </span>
                        <span className={`tc-status ${tc.passed ? 'text-success' : 'text-danger'}`}>
                          {tc.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      <div className="tc-details">
                        <div className="tc-line">
                          <strong>Input:</strong> <code>{JSON.stringify(tc.args)}</code>
                        </div>
                        <div className="tc-line">
                          <strong>Expected:</strong> <code>{JSON.stringify(tc.expected)}</code>
                        </div>
                        <div className="tc-line">
                          <strong>Output:</strong> <code>{JSON.stringify(tc.actual)}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* In-Page CSS */}
      <style>{`
        @keyframes timer-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(239, 68, 68, 0.4); }
          50% { transform: scale(1.04); box-shadow: 0 0 20px rgba(239, 68, 68, 0.7); }
        }
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .datadrix-solver-page {
          max-width: 1480px;
          margin: 0 auto;
          padding: 16px 20px 60px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .datadrix-solver-page.fullscreen-mode {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          max-width: 100vw;
          z-index: 9999;
          background: #07090e;
          padding: 12px 18px;
          overflow: hidden;
        }

        /* Top Header Bar */
        .solver-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-radius: var(--radius-lg);
          background: rgba(13, 18, 30, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
          gap: 16px;
          flex-wrap: wrap;
        }
        .solver-nav-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.04);
          transition: all 0.2s;
        }
        .back-link:hover {
          color: #fff;
          background: rgba(99, 102, 241, 0.2);
          transform: translateX(-2px);
        }
        .divider {
          color: rgba(255, 255, 255, 0.15);
        }
        .problem-current-title {
          font-weight: 800;
          font-size: 1.05rem;
          color: var(--text-primary);
        }
        .points-badge {
          font-size: 0.74rem;
          font-weight: 800;
          color: #c7d2fe;
          background: rgba(99, 102, 241, 0.18);
          border: 1px solid rgba(99, 102, 241, 0.35);
          padding: 3px 8px;
          border-radius: 6px;
        }
        .solved-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.74rem;
          font-weight: 800;
          color: #10b981;
          background: rgba(16, 185, 129, 0.18);
          border: 1px solid rgba(16, 185, 129, 0.35);
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.25);
          padding: 3px 8px;
          border-radius: 6px;
        }
        .solver-nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Interview Timer */
        .interview-timer-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.82rem;
          color: var(--text-secondary);
        }
        .interview-timer-pill.timer-danger {
          border-color: rgba(239, 68, 68, 0.6);
          color: #f87171;
          background: rgba(239, 68, 68, 0.15);
          animation: timer-pulse 1.5s ease-in-out infinite;
        }
        .timer-val {
          font-family: monospace;
          font-weight: 800;
          font-size: 0.92rem;
          letter-spacing: 0.05em;
          color: #38bdf8;
        }
        .interview-timer-pill.timer-danger .timer-val {
          color: #f87171;
        }
        .timer-toggle-btn {
          background: none;
          border: none;
          color: #818cf8;
          font-weight: 800;
          font-size: 0.76rem;
          cursor: pointer;
          padding: 0 4px;
          text-transform: uppercase;
        }
        .timer-reset-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: transform 0.2s;
        }
        .timer-reset-btn:hover {
          transform: rotate(-180deg);
          color: var(--text-primary);
        }

        .action-icon-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-secondary);
          padding: 7px 11px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .action-icon-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
          border-color: #6366f1;
          transform: translateY(-1px);
        }

        /* Workspace Grid */
        .solver-workspace {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 16px;
          min-height: calc(100vh - 160px);
        }
        .fullscreen-mode .solver-workspace {
          height: calc(100vh - 80px);
        }

        /* Left Side: Problem Info Pane */
        .problem-info-pane {
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: rgba(13, 18, 30, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.5);
        }
        .pane-tabs-header {
          display: flex;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          overflow-x: auto;
          padding: 4px 6px;
          gap: 4px;
        }
        .pane-tab {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 14px;
          background: none;
          border: 1px solid transparent;
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .pane-tab:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.04);
        }
        .pane-tab.active {
          color: #fff;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25));
          border-color: rgba(129, 140, 248, 0.5);
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
        }
        .pane-scroll-content {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .prob-title {
          font-size: 1.55rem;
          font-weight: 900;
          margin: 0 0 10px 0;
          letter-spacing: -0.01em;
        }
        .prob-meta-row {
          display: flex;
          gap: 18px;
          font-size: 0.82rem;
          color: var(--text-muted);
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .company-tags-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }
        .companies-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 700;
        }
        .statement-text {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--text-primary);
          margin-bottom: 22px;
        }
        .examples-section h3, .constraints-section h3 {
          font-size: 1.05rem;
          font-weight: 800;
          margin: 22px 0 12px 0;
        }
        .example-card {
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 14px;
          font-size: 0.88rem;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
        }
        .example-header {
          font-weight: 800;
          color: #a5b4fc;
          margin-bottom: 8px;
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .example-line {
          margin-bottom: 6px;
        }
        .example-line code {
          background: rgba(255, 255, 255, 0.08);
          padding: 3px 8px;
          border-radius: 6px;
          font-family: monospace;
          color: #38bdf8;
          font-weight: 600;
        }
        .constraints-list {
          padding-left: 22px;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }
        .constraints-list li {
          margin-bottom: 6px;
        }
        .constraints-list code {
          color: #fbbf24;
          background: rgba(245, 158, 11, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }

        /* Hints Tab */
        .hints-intro, .custom-intro, .editorial-header, .submissions-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }
        .hints-intro h4, .custom-intro h4, .editorial-header h4, .submissions-header h4 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
        }
        .hints-intro p, .custom-intro p, .submissions-header p {
          margin: 0;
          font-size: 0.84rem;
          color: var(--text-muted);
        }
        .hints-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .hint-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 16px 18px;
          transition: border-color 0.2s;
        }
        .hint-card:hover {
          border-color: rgba(245, 158, 11, 0.4);
        }
        .hint-num {
          font-size: 0.74rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #fbbf24;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          padding: 3px 8px;
          border-radius: 6px;
        }
        .hint-text {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 10px 0 0 0;
          line-height: 1.6;
        }

        /* Custom Input Tab */
        .custom-input-box {
          margin-bottom: 16px;
        }
        .input-label {
          display: block;
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .custom-textarea {
          width: 100%;
          background: #090d16;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: var(--text-primary);
          padding: 12px;
          font-family: monospace;
          font-size: 0.9rem;
          resize: vertical;
        }
        .custom-textarea:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 16px rgba(99, 102, 241, 0.25);
        }
        .input-help {
          display: block;
          font-size: 0.76rem;
          color: var(--text-muted);
          margin-top: 6px;
        }
        .run-custom-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          padding: 9px 18px;
        }
        .custom-result-card {
          padding: 14px 18px;
          border-radius: 10px;
          font-size: 0.88rem;
          border: 1px solid transparent;
        }
        .custom-result-card.res-success {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.35);
        }
        .custom-result-card.res-error {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.35);
        }
        .res-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.76rem;
          font-weight: 800;
          color: var(--text-muted);
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .res-output {
          margin: 0;
          font-family: monospace;
          color: #34d399;
          white-space: pre-wrap;
          font-size: 0.9rem;
        }
        .res-error-text {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #f87171;
        }

        /* Community Discuss Tab */
        .discuss-tab-body {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .new-comment-form {
          padding: 16px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.3);
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 12px;
        }
        .comment-input, .comment-textarea {
          width: 100%;
          background: #090d16;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-primary);
          padding: 10px 14px;
          font-size: 0.85rem;
        }
        .comment-input:focus, .comment-textarea:focus {
          outline: none;
          border-color: #6366f1;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
        }
        .comments-feed {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .comment-card {
          padding: 16px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(0, 0, 0, 0.25);
        }
        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .comment-author-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .author-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          font-size: 0.8rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.35);
        }
        .author-name {
          font-size: 0.88rem;
          font-weight: 800;
        }
        .author-sub {
          font-size: 0.74rem;
          color: var(--text-muted);
        }
        .author-role {
          color: #34d399;
          font-weight: 700;
        }
        .upvote-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          padding: 5px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.78rem;
          font-weight: 700;
          transition: all 0.2s;
        }
        .upvote-btn:hover {
          color: #6366f1;
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.1);
          transform: translateY(-1px);
        }
        .comment-title {
          font-size: 0.96rem;
          font-weight: 800;
          margin: 0 0 6px 0;
          color: #c7d2fe;
        }
        .comment-body {
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.6;
        }

        /* Editorial Tab */
        .editorial-tab-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .approach-tag {
          font-size: 0.78rem;
          color: #34d399;
          font-weight: 700;
          background: rgba(16, 185, 129, 0.15);
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .editorial-desc {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.65;
        }
        .editorial-lang-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }
        .ed-lang-btn {
          padding: 6px 14px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }
        .ed-lang-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
        }
        .ed-lang-btn.active {
          background: #10b981;
          color: white;
          border-color: #10b981;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.35);
        }
        .editorial-code-box {
          background: #090d16;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        .editorial-pre {
          margin: 0 0 14px 0;
          font-family: 'Fira Code', monospace;
          font-size: 0.88rem;
          line-height: 1.6;
          color: #e2e8f0;
          white-space: pre-wrap;
          max-height: 320px;
          overflow-y: auto;
        }
        .editorial-code-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 14px;
        }

        /* Submissions Tab */
        .submissions-table {
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.25);
        }
        .sub-header-row {
          display: grid;
          grid-template-columns: 1.5fr 1.2fr 1fr 1fr 1fr;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.76rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .sub-row {
          display: grid;
          grid-template-columns: 1.5fr 1.2fr 1fr 1fr 1fr;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          align-items: center;
          font-size: 0.85rem;
        }
        .sub-verdict {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 800;
        }
        .verdict-pass {
          color: #34d399;
        }
        .verdict-fail {
          color: #f87171;
        }
        .empty-submissions {
          padding: 36px;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.88rem;
        }

        /* Right Side: Code Editor Pane */
        .code-editor-pane {
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #080b12;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.5);
        }
        .editor-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-wrap: wrap;
          gap: 10px;
        }
        .toolbar-left, .toolbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .tool-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
        }
        .lang-selector-group {
          display: flex;
          gap: 5px;
        }
        .lang-btn {
          padding: 5px 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid transparent;
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lang-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
        }
        .lang-btn.active {
          color: #fff;
          background: #6366f1;
          box-shadow: 0 2px 10px rgba(99, 102, 241, 0.4);
        }
        .tool-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-secondary);
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 0.76rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tool-action-btn:hover {
          color: var(--text-primary);
          border-color: rgba(99, 102, 241, 0.4);
          background: rgba(255, 255, 255, 0.06);
        }
        .code-editor-wrap {
          flex: 1;
          display: flex;
          background: #06090f;
          min-height: 400px;
        }
        .code-textarea {
          width: 100%;
          height: 100%;
          min-height: 400px;
          background: transparent;
          border: none;
          color: #f8fafc;
          padding: 18px;
          font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
          font-size: 0.94rem;
          line-height: 1.65;
          resize: none;
          outline: none;
          tab-size: 4;
        }
        .editor-footer-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          flex-wrap: wrap;
          gap: 10px;
        }
        .shortcuts-hint {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .shortcuts-hint code {
          background: rgba(255, 255, 255, 0.06);
          padding: 2px 6px;
          border-radius: 4px;
          color: #a5b4fc;
        }
        .action-buttons-group {
          display: flex;
          gap: 10px;
        }
        .submit-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
        }
        .submit-btn:hover {
          box-shadow: 0 6px 22px rgba(16, 185, 129, 0.55);
        }

        /* Results Drawer */
        .results-drawer {
          border-top: 2px solid;
          background: rgba(10, 14, 24, 0.98);
          max-height: 300px;
          overflow-y: auto;
          padding: 16px;
        }
        .results-drawer.all-passed {
          border-top-color: #10b981;
        }
        .results-drawer.has-failures {
          border-top-color: #ef4444;
        }
        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .drawer-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .verdict-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 0.84rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          padding: 4px 10px;
          border-radius: 8px;
        }
        .tag-success {
          background: rgba(16, 185, 129, 0.18);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.35);
        }
        .tag-failed {
          background: rgba(239, 68, 68, 0.18);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.35);
        }
        .time-badge {
          font-size: 0.78rem;
          font-weight: 700;
          color: #cbd5e1;
          background: rgba(255, 255, 255, 0.08);
          padding: 2px 8px;
          border-radius: 6px;
        }
        .score-summary {
          font-size: 0.86rem;
          font-weight: 800;
          color: var(--text-secondary);
        }
        .error-body pre {
          color: #f87171;
          font-family: monospace;
          font-size: 0.84rem;
          margin: 0;
          white-space: pre-wrap;
          background: rgba(239, 68, 68, 0.08);
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .test-cases-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .testcase-row {
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.84rem;
        }
        .tc-pass {
          border-left: 3px solid #10b981;
        }
        .tc-fail {
          border-left: 3px solid #ef4444;
        }
        .tc-header {
          display: flex;
          justify-content: space-between;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .tc-index {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }
        .tc-details {
          display: flex;
          flex-direction: column;
          gap: 3px;
          font-family: monospace;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        /* Award Toast */
        .award-toast {
          position: fixed;
          bottom: 28px;
          right: 28px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 24px;
          border-radius: var(--radius-lg);
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid #fbbf24;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(251, 191, 36, 0.3);
          z-index: 1000;
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .award-toast-content {
          display: flex;
          flex-direction: column;
        }
        .award-toast-content strong {
          color: #fbbf24;
          font-size: 0.95rem;
          font-weight: 800;
        }
        .award-toast-content span {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }

        @media (max-width: 900px) {
          .solver-workspace {
            grid-template-columns: 1fr;
          }
        }

        /* Template Dropdown Styles */
        .template-dropdown-wrap {
          position: relative;
        }
        .template-dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          min-width: 220px;
          padding: 8px;
          border-radius: 12px;
          background: #0d121f;
          border: 1px solid rgba(99, 102, 241, 0.3);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 100;
        }
        .template-dropdown-menu button {
          text-align: left;
          padding: 8px 12px;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .template-dropdown-menu button:hover {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
        }

        /* Visualizer Styles */
        .visualizer-tab-body {
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 6px 0;
        }
        .visualizer-header {
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .vis-title-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .vis-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(16, 185, 129, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .vis-heading {
          font-size: 1.05rem;
          font-weight: 800;
          margin: 0 0 4px 0;
        }
        .vis-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.4;
        }
        .visualizer-canvas {
          padding: 24px 20px;
          border-radius: var(--radius-lg);
          background: rgba(10, 15, 29, 0.7);
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }
        .canvas-elements-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          min-height: 110px;
          align-items: flex-start;
          padding: 8px 0;
        }
        .array-cell-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .cell-index-label {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }
        .array-cell-box {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: 1.15rem;
          font-weight: 800;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .array-cell-box.active-cell {
          border-color: #f59e0b;
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.35);
          background: rgba(245, 158, 11, 0.12);
          transform: translateY(-3px);
        }
        .array-cell-box.left-ptr-cell {
          border-color: #34d399;
          box-shadow: 0 0 15px rgba(52, 211, 153, 0.4);
          background: rgba(52, 211, 153, 0.12);
        }
        .array-cell-box.right-ptr-cell {
          border-color: #38bdf8;
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
          background: rgba(56, 189, 248, 0.12);
        }
        .pointers-stack {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-height: 22px;
          align-items: center;
        }
        .ptr-pill {
          font-size: 0.68rem;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .ptr-left {
          background: rgba(52, 211, 153, 0.2);
          color: #34d399;
          border: 1px solid rgba(52, 211, 153, 0.4);
        }
        .ptr-right {
          background: rgba(56, 189, 248, 0.2);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.4);
        }
        .ptr-mid {
          background: rgba(167, 139, 250, 0.2);
          color: #a78bfa;
          border: 1px solid rgba(167, 139, 250, 0.4);
        }
        .ptr-curr {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.4);
        }
        .visualizer-hud-row {
          width: 100%;
          display: flex;
          justify-content: space-around;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .vis-hud-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
        }
        .vis-hud-lbl {
          color: var(--text-muted);
          font-weight: 600;
        }
        .vis-hud-val {
          font-weight: 800;
          font-family: var(--font-mono);
        }
        .step-narrative-card {
          padding: 18px 20px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .narrative-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .step-counter-pill {
          font-size: 0.72rem;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 999px;
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
        }
        .step-status-tag {
          font-size: 0.78rem;
          color: #34d399;
          font-weight: 700;
        }
        .step-explanation-text {
          font-size: 0.88rem;
          color: var(--text-primary);
          line-height: 1.5;
          margin: 0;
        }
        .step-action-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
        }
        .action-label {
          color: var(--text-muted);
          font-weight: 600;
        }
        .action-code-tag {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.2);
          padding: 2px 8px;
          border-radius: 6px;
          font-family: var(--font-mono);
          font-size: 0.82rem;
        }
        .visualizer-controls-bar {
          padding: 14px 18px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .vis-slider-wrap {
          flex: 1;
          min-width: 120px;
          display: flex;
          align-items: center;
        }
        .vis-range-slider {
          width: 100%;
          cursor: pointer;
        }

        /* DrixBot AI Styles */
        .drixbot-tab-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .drixbot-hero {
          padding: 18px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 14px;
          background: linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%);
          border: 1px solid rgba(167, 139, 250, 0.25);
        }
        .drixbot-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(167, 139, 250, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .drixbot-title {
          font-size: 1.05rem;
          font-weight: 800;
          margin: 0;
        }
        .drixbot-badge {
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(167, 139, 250, 0.2);
          color: #c4b5fd;
        }
        .drixbot-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 4px 0 0 0;
          line-height: 1.4;
        }
        .drixbot-subtools {
          display: flex;
          gap: 8px;
        }
        .bot-tool-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: var(--text-secondary);
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }
        .bot-tool-btn:hover {
          color: var(--text-primary);
          border-color: rgba(167, 139, 250, 0.3);
        }
        .bot-tool-btn.active {
          background: rgba(167, 139, 250, 0.15);
          border-color: #a78bfa;
          color: #e0e7ff;
        }
        .bot-analysis-card {
          padding: 20px;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .complexity-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .comp-metric-box {
          padding: 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .comp-metric-lbl {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
        }
        .comp-metric-val {
          font-size: 1.15rem;
          font-weight: 800;
          font-family: var(--font-mono);
        }
        .comp-metric-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .text-success { color: #34d399; }
        .text-warning { color: #f59e0b; }
        .text-info { color: #38bdf8; }
        .comp-findings-box {
          padding: 12px 14px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.02);
        }
        .findings-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin: 0 0 8px 0;
        }
        .findings-list {
          margin: 0;
          padding-left: 18px;
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .comp-tip-box {
          padding: 12px 14px;
          border-radius: 8px;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.2);
          font-size: 0.82rem;
          color: #c7d2fe;
          line-height: 1.5;
        }
        .edge-cases-header h4 {
          margin: 0 0 4px 0;
          font-size: 0.95rem;
          font-weight: 800;
        }
        .edge-cases-header p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .edge-cases-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .edge-case-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .ec-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ec-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ec-title {
          font-size: 0.85rem;
          font-weight: 700;
        }
        .ec-tag {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .tag-safe {
          background: rgba(52, 211, 153, 0.15);
          color: #34d399;
        }
        .tag-alert {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }
        .ec-rec {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin: 0;
        }
        .intuition-steps-wrap {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .intuition-step {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }
        .step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .step-text h5 {
          margin: 0 0 4px 0;
          font-size: 0.9rem;
          font-weight: 700;
        }
        .step-text p {
          margin: 0;
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

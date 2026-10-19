import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  CheckCircle2,
  Circle,
  Search,
  ArrowRight,
  Award,
  Zap,
  Building,
  Sparkles,
  Flame,
  Calendar,
  BookOpen,
  Filter,
  Layers,
  Clock,
  TrendingUp,
  X,
  ChevronRight,
  Star,
  Compass,
  Check,
  Briefcase,
  Share2,
  Target,
  FileText,
  HelpCircle,
  BarChart3,
  Trophy,
  Medal,
  Users,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  Brain,
  CheckSquare,
  Flag
} from 'lucide-react';
import confetti from 'canvas-confetti';

import {
  PROBLEMS_CATALOG,
  ALL_COMPANIES,
  DATADRIX_TRACKS,
  DATADRIX_INTERVIEW_EXPERIENCES,
  DATADRIX_CONTESTS,
  DATADRIX_LEADERBOARD,
  DATADRIX_COMPANY_KITS
} from '../data/problemsData';


export default function Practice() {
  const [activeTab, setActiveTab] = useState('arena'); // 'arena' | 'contests' | 'company-kits' | 'leaderboard' | 'tracks' | 'experiences'
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [expandedExpId, setExpandedExpId] = useState(DATADRIX_INTERVIEW_EXPERIENCES[0]?.id || null);

  // Contests & Virtual Contest Arena State
  const [contestFilter, setContestFilter] = useState('all'); // 'all' | 'live' | 'upcoming' | 'past'
  const [registeredContestIds, setRegisteredContestIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('datadrix_registered_contests') || '["job-a-thon-38"]');
    } catch {
      return ['job-a-thon-38'];
    }
  });
  const [activeVirtualContest, setActiveVirtualContest] = useState(null);
  const [virtualContestSeconds, setVirtualContestSeconds] = useState(90 * 60);
  const [isVirtualContestActive, setIsVirtualContestActive] = useState(false);
  const [contestSolved, setContestSolved] = useState([]);
  const [contestPenaltyMinutes, setContestPenaltyMinutes] = useState(0);
  const [contestSummary, setContestSummary] = useState(null);
  const [simulatedCompetitors, setSimulatedCompetitors] = useState([
    { name: 'shubham_iitb', institute: 'IIT Bombay', score: 300, solvedCount: 1, avatar: 'SI' },
    { name: 'priya_algo', institute: 'IIIT Hyderabad', score: 200, solvedCount: 1, avatar: 'PA' },
    { name: 'aditya_dsa', institute: 'DTU Delhi', score: 100, solvedCount: 1, avatar: 'AD' },
    { name: 'alex_chen', institute: 'UC Berkeley', score: 100, solvedCount: 1, avatar: 'AC' },
    { name: 'kunal_kush', institute: 'Jamia Millia', score: 0, solvedCount: 0, avatar: 'KK' },
    { name: 'rohan_dev', institute: 'BITS Pilani', score: 0, solvedCount: 0, avatar: 'RD' }
  ]);

  // Company Interview Kits State
  const [selectedCompanyKit, setSelectedCompanyKit] = useState('amazon');

  // Leaderboard State
  const [leaderboardInstitute, setLeaderboardInstitute] = useState('all');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');

  // Solved list from localStorage
  const [solvedList, setSolvedList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('solved_problems') || '[]');
    } catch {
      return [];
    }
  });

  // Starred / Bookmarked list
  const [starredList, setStarredList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bookmarked_problems') || '[]');
    } catch {
      return [];
    }
  });

  const toggleStar = (slug, e) => {
    e.preventDefault();
    e.stopPropagation();
    setStarredList(prev => {
      const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug];
      localStorage.setItem('bookmarked_problems', JSON.stringify(next));
      return next;
    });
  };

  // Calculate Coder Points, Rank, and Streak
  const { totalPoints, streak, coderRank } = useMemo(() => {
    let pts = 0;
    solvedList.forEach(slug => {
      const p = PROBLEMS_CATALOG.find(x => x.slug === slug);
      if (p) pts += p.points || 3;
    });

    let rank = 'Coder Initiate 🌱';
    if (pts >= 40) rank = 'DataDrix Grandmaster 👑';
    else if (pts >= 25) rank = 'Algorithmic Master 🚀';
    else if (pts >= 10) rank = 'Code Enthusiast ⚡';

    const storedStreak = parseInt(localStorage.getItem('coding_streak') || '3', 10);
    return { totalPoints: pts, streak: storedStreak, coderRank: rank };
  }, [solvedList]);

  // Dynamic Problem of the Day (POTD) based on day of year
  const potd = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const index = dayOfYear % PROBLEMS_CATALOG.length;
    return PROBLEMS_CATALOG[index] || PROBLEMS_CATALOG[0];
  }, []);

  const isPotdSolved = solvedList.includes(potd.slug);

  // Categories list
  const categories = useMemo(() => {
    return Array.from(new Set(PROBLEMS_CATALOG.map(p => p.category)));
  }, []);

  // Filtered problems in Coding Arena
  const filtered = useMemo(() => {
    return PROBLEMS_CATALOG.filter(p => {
      if (onlyStarred && !starredList.includes(p.slug)) return false;
      if (selectedTrack) {
        const trackObj = DATADRIX_TRACKS.find(t => t.id === selectedTrack);
        if (trackObj && !trackObj.problemSlugs.includes(p.slug)) return false;
      }
      if (difficulty !== 'all' && p.difficulty.toLowerCase() !== difficulty.toLowerCase()) return false;
      if (category !== 'all' && p.category.toLowerCase() !== category.toLowerCase()) return false;
      if (companyFilter !== 'All' && !p.companies.includes(companyFilter)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const mTitle = p.title.toLowerCase().includes(q);
        const mCat = p.category.toLowerCase().includes(q);
        const mComp = p.companies.some(c => c.toLowerCase().includes(q));
        if (!mTitle && !mCat && !mComp) return false;
      }
      return true;
    });
  }, [difficulty, category, companyFilter, searchQuery, selectedTrack, onlyStarred, starredList]);

  // 30-day activity simulation for the Activity Heatmap
  const activityHeatmap = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const isToday = i === 0;
      // Mark active if in streak
      const isActive = i < streak || (isToday && isPotdSolved);
      days.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: isActive ? (i === 0 && isPotdSolved ? 2 : 1) : 0,
        isActive
      });
    }
    return days;
  }, [streak, isPotdSolved]);

  // Virtual Contest Finish Handler
  const finishVirtualContest = useCallback(() => {
    setIsVirtualContestActive(false);
    confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 } });

    let myScore = 0;
    if (activeVirtualContest) {
      activeVirtualContest.problems.forEach(p => {
        if (contestSolved.includes(p.slug)) myScore += p.points;
      });
    }

    const higherCount = simulatedCompetitors.filter(c => c.score > myScore).length;
    const computedRank = higherCount + 1;
    const ratingDelta = myScore >= 700 ? 54 : myScore >= 400 ? 38 : myScore > 0 ? 22 : -12;

    setContestSummary({
      contestTitle: activeVirtualContest?.title || 'DataDrix Weekly Contest',
      myScore,
      totalPossible: activeVirtualContest?.totalScore || 1000,
      solvedCount: contestSolved.length,
      totalProblems: activeVirtualContest?.problems?.length || 4,
      rank: computedRank,
      totalParticipants: (activeVirtualContest?.registeredCount || 15000) + 1,
      ratingDelta,
      percentile: (100 - (computedRank / 150)).toFixed(1) + '%'
    });
  }, [activeVirtualContest, contestSolved, simulatedCompetitors]);

  // Virtual Contest Countdown Timer
  useEffect(() => {
    let interval = null;
    if (activeVirtualContest && isVirtualContestActive && virtualContestSeconds > 0) {
      interval = setInterval(() => {
        setVirtualContestSeconds(sec => {
          if (sec <= 1) {
            setIsVirtualContestActive(false);
            finishVirtualContest();
            return 0;
          }
          return sec - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeVirtualContest, isVirtualContestActive, virtualContestSeconds, finishVirtualContest]);

  // Live dynamic competitor score simulation during virtual contest
  useEffect(() => {
    let simInterval = null;
    if (activeVirtualContest && isVirtualContestActive) {
      simInterval = setInterval(() => {
        setSimulatedCompetitors(prev => {
          return prev.map(comp => {
            if (Math.random() < 0.28 && comp.score < 1000) {
              const inc = Math.min(100, 1000 - comp.score);
              return { ...comp, score: comp.score + inc, solvedCount: comp.solvedCount + 1 };
            }
            return comp;
          }).sort((a, b) => b.score - a.score);
        });
      }, 7000);
    }
    return () => clearInterval(simInterval);
  }, [activeVirtualContest, isVirtualContestActive]);

  // Virtual Contest Handlers
  const startVirtualContest = (contest) => {
    setActiveVirtualContest(contest);
    setVirtualContestSeconds((contest.durationMinutes || 90) * 60);
    setIsVirtualContestActive(true);
    setContestSolved([]);
    setContestPenaltyMinutes(0);
    setContestSummary(null);
    setSimulatedCompetitors([
      { name: 'shubham_iitb', institute: 'IIT Bombay', score: 300, solvedCount: 1, avatar: 'SI' },
      { name: 'priya_algo', institute: 'IIIT Hyderabad', score: 200, solvedCount: 1, avatar: 'PA' },
      { name: 'aditya_dsa', institute: 'DTU Delhi', score: 100, solvedCount: 1, avatar: 'AD' },
      { name: 'alex_chen', institute: 'UC Berkeley', score: 100, solvedCount: 1, avatar: 'AC' },
      { name: 'kunal_kush', institute: 'Jamia Millia', score: 0, solvedCount: 0, avatar: 'KK' },
      { name: 'rohan_dev', institute: 'BITS Pilani', score: 0, solvedCount: 0, avatar: 'RD' }
    ]);
    setActiveTab('contests');
  };

  const markContestProblemSolved = (slug, points) => {
    if (!contestSolved.includes(slug)) {
      setContestSolved(prev => [...prev, slug]);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      setSolvedList(prev => {
        if (!prev.includes(slug)) {
          const next = [...prev, slug];
          localStorage.setItem('solved_problems', JSON.stringify(next));
          return next;
        }
        return prev;
      });
    }
  };

  const toggleRegisterContest = (contestId) => {
    setRegisteredContestIds(prev => {
      const next = prev.includes(contestId) ? prev.filter(id => id !== contestId) : [...prev, contestId];
      localStorage.setItem('datadrix_registered_contests', JSON.stringify(next));
      return next;
    });
  };

  const formatContestTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Filtered Leaderboard
  const filteredLeaderboard = useMemo(() => {
    return DATADRIX_LEADERBOARD.filter(item => {
      if (leaderboardInstitute !== 'all' && item.institute !== leaderboardInstitute) return false;
      if (leaderboardSearch) {
        const q = leaderboardSearch.toLowerCase();
        const matchHandle = item.handle.toLowerCase().includes(q);
        const matchName = item.name.toLowerCase().includes(q);
        const matchInst = item.institute.toLowerCase().includes(q);
        if (!matchHandle && !matchName && !matchInst) return false;
      }
      return true;
    });
  }, [leaderboardInstitute, leaderboardSearch]);

  return (
    <div className="datadrix-practice-page">
      {/* Hero Header with DataDrix Branding and Gamified Scorecard */}
      <div className="practice-hero-card glass-panel">
        <div className="hero-top-row">
          <div className="hero-title-area">
            <div className="datadrix-badge">
              <Zap size={15} /> DATADRIX CODING ARENA & SDE SUITE
            </div>
            <h1>
              Practice <span className="text-gradient">Algorithms & DSA</span>
            </h1>
            <p className="hero-desc">
              Prepare for Google, Amazon, Microsoft, and Meta coding interviews. Practice real problems with automated test case evaluation, progressive hints, multi-language solutions, and company interview archives.
            </p>

            <div className="hero-quick-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCheatSheet(true)}
              >
                <BookOpen size={14} color="#818cf8" />
                <span>DataDrix Big-O & DSA Patterns</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'experiences' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('experiences')}
              >
                <Building size={14} color="#34d399" />
                <span>Company Interview Corner</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'tracks' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('tracks')}
              >
                <Layers size={14} color="#f59e0b" />
                <span>Curated SDE Sheets</span>
              </button>
            </div>
          </div>

          {/* Gamified Coder Scorecard & 30-Day Activity Heatmap */}
          <div className="coder-scorecard glass-panel">
            <div className="scorecard-header">
              <div className="scorecard-rank">
                <span className="rank-label">Current Coder Tier</span>
                <span className="rank-val">{coderRank}</span>
              </div>
              <div className="streak-pill">
                <Flame size={16} />
                <span>{streak} Day Streak</span>
              </div>
            </div>

            <div className="scorecard-stats-grid">
              <div className="scorecard-stat">
                <span className="stat-label">Coding Points</span>
                <span className="stat-num text-gradient">{totalPoints}</span>
              </div>
              <div className="scorecard-stat">
                <span className="stat-label">Solved</span>
                <span className="stat-num">
                  {solvedList.length} <small>/ {PROBLEMS_CATALOG.length}</small>
                </span>
              </div>
              <div className="scorecard-stat">
                <span className="stat-label">Accuracy</span>
                <span className="stat-num" style={{ color: '#34d399' }}>94%</span>
              </div>
            </div>

            {/* 30-Day Contribution Heatmap */}
            <div className="heatmap-section">
              <div className="heatmap-header">
                <span className="heatmap-title">30-Day Activity Tracker</span>
                <span className="heatmap-active-tag">{streak} Active Days</span>
              </div>
              <div className="heatmap-grid" title="Daily Problem Solving Activity">
                {activityHeatmap.map((day, idx) => (
                  <div
                    key={idx}
                    className={`heatmap-box ${day.isActive ? 'active' : ''}`}
                    title={`${day.date}: ${day.count} problem${day.count !== 1 ? 's' : ''} solved`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem of the Day (POTD) Banner */}
      <div className="potd-banner glass-panel">
        <div className="potd-left">
          <div className="potd-badge-row">
            <span className="potd-pill">
              <Flame size={14} color="#f97316" /> PROBLEM OF THE DAY
            </span>
            <span className="potd-bonus">⭐ +{potd.points + 3} Score Points Bonus</span>
            {isPotdSolved && <span className="potd-solved-tag"><CheckCircle2 size={13} /> Completed Today</span>}
          </div>
          <h3 className="potd-title">{potd.title}</h3>
          <p className="potd-desc">{potd.description.slice(0, 150)}...</p>
          <div className="potd-tags">
            <span className="potd-tag">{potd.category}</span>
            <span className={`diff-pill diff-${potd.difficulty.toLowerCase()}`}>{potd.difficulty}</span>
            {potd.companies.slice(0, 3).map(c => (
              <span key={c} className="company-tag">{c}</span>
            ))}
          </div>
        </div>

        <div className="potd-right">
          <div className="potd-countdown">
            <Clock size={16} /> Resets in 08h : 34m
          </div>
          <Link to={`/practice/${potd.slug}`} className="btn btn-primary potd-cta-btn">
            <span>{isPotdSolved ? 'Review Solution' : 'Solve POTD Now'}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Main Feature Tabs: Coding Arena vs Contests vs Company Kits vs Leaderboard vs SDE Sheets vs Interview Experiences */}
      <div className="practice-nav-tabs">
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'arena' ? 'active' : ''}`}
          onClick={() => setActiveTab('arena')}
        >
          <Code2 size={17} />
          <span>Coding Arena ({PROBLEMS_CATALOG.length})</span>
        </button>
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'contests' ? 'active' : ''}`}
          onClick={() => setActiveTab('contests')}
        >
          <Trophy size={17} color="#f59e0b" />
          <span>Contests & Job-A-Thon ({DATADRIX_CONTESTS.length})</span>
        </button>
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'company-kits' ? 'active' : ''}`}
          onClick={() => setActiveTab('company-kits')}
        >
          <Briefcase size={17} color="#3b82f6" />
          <span>Company Prep Hub ({DATADRIX_COMPANY_KITS.length})</span>
        </button>
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <Medal size={17} color="#10b981" />
          <span>Global Leaderboard</span>
        </button>
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'tracks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracks')}
        >
          <Layers size={17} />
          <span>Curated SDE Sheets ({DATADRIX_TRACKS.length})</span>
        </button>
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'experiences' ? 'active' : ''}`}
          onClick={() => setActiveTab('experiences')}
        >
          <Building size={17} />
          <span>Interview Archives ({DATADRIX_INTERVIEW_EXPERIENCES.length})</span>
        </button>
      </div>

      {/* TAB 1: CODING ARENA (ALL PROBLEMS) */}
      {activeTab === 'arena' && (
        <>
          {/* Active Track Banner if filtered by a track */}
          {selectedTrack && (
            <div className="active-track-banner glass-panel">
              <div className="track-banner-info">
                <span className="track-badge">Active SDE Track</span>
                <span className="track-title">{DATADRIX_TRACKS.find(t => t.id === selectedTrack)?.title}</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedTrack(null)}
              >
                Clear Track Filter
              </button>
            </div>
          )}

          {/* Filter Bar: Companies, Difficulty, Topic, Search, Starred */}
          <div className="practice-filter-card glass-panel">
            {/* Top Company Pills */}
            <div className="company-filter-row">
              <span className="filter-label">
                <Building size={14} /> Companies:
              </span>
              <div className="company-pills-scroll">
                {ALL_COMPANIES.map(comp => (
                  <button
                    key={comp}
                    type="button"
                    className={`company-chip ${companyFilter === comp ? 'active' : ''}`}
                    onClick={() => setCompanyFilter(comp)}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdown Filters & Search */}
            <div className="controls-row">
              <div className="search-box-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search problem, company, or concept..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="filter-selects">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Topics</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Difficulties</option>
                  <option value="basic">Basic</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <button
                  type="button"
                  className={`btn btn-sm ${onlyStarred ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setOnlyStarred(!onlyStarred)}
                  title="Show only bookmarked questions"
                >
                  <Star size={14} fill={onlyStarred ? '#fbbf24' : 'none'} color="#fbbf24" />
                  <span>Starred ({starredList.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Problems Table */}
          <div className="problems-table-wrapper glass-panel">
            <div className="table-header-row">
              <span className="th status-th">Status</span>
              <span className="th title-th">Problem Title</span>
              <span className="th category-th">Topic</span>
              <span className="th diff-th">Difficulty</span>
              <span className="th accuracy-th">Accuracy</span>
              <span className="th points-th">Points</span>
              <span className="th companies-th">Companies</span>
              <span className="th action-th">Action</span>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <HelpCircle size={36} color="var(--text-muted)" />
                <p>No coding challenges found matching the active criteria.</p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setDifficulty('all');
                    setCategory('all');
                    setCompanyFilter('All');
                    setSelectedTrack(null);
                    setSearchQuery('');
                    setOnlyStarred(false);
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="table-body">
                {filtered.map(p => {
                  const isSolved = solvedList.includes(p.slug);
                  const isStarred = starredList.includes(p.slug);
                  return (
                    <div key={p.slug} className={`table-row ${isSolved ? 'row-solved' : ''}`}>
                      <div className="td status-td">
                        {isSolved ? (
                          <CheckCircle2 size={18} color="#10b981" title="Solved" />
                        ) : (
                          <Circle size={18} color="var(--border-color)" title="Unsolved" />
                        )}
                        <button
                          type="button"
                          className="star-btn"
                          onClick={(e) => toggleStar(p.slug, e)}
                          title={isStarred ? "Remove from starred" : "Bookmark for revision"}
                        >
                          <Star size={15} fill={isStarred ? "#fbbf24" : "none"} color={isStarred ? "#fbbf24" : "var(--text-muted)"} />
                        </button>
                      </div>

                      <div className="td title-td">
                        <Link to={`/practice/${p.slug}`} className="problem-link">
                          {p.title}
                        </Link>
                        <div className="mobile-tags">
                          <span className={`diff-pill diff-${p.difficulty.toLowerCase()}`}>
                            {p.difficulty}
                          </span>
                          <span className="cat-pill">{p.category}</span>
                        </div>
                      </div>

                      <div className="td category-td">
                        <span className="topic-badge">{p.category}</span>
                      </div>

                      <div className="td diff-td">
                        <span className={`diff-pill diff-${p.difficulty.toLowerCase()}`}>
                          {p.difficulty}
                        </span>
                      </div>

                      <div className="td accuracy-td">
                        <span className="acc-val">{p.accuracy}</span>
                      </div>

                      <div className="td points-td">
                        <span className="points-pill">+{p.points} Pts</span>
                      </div>

                      <div className="td companies-td">
                        <div className="companies-wrap">
                          {p.companies.slice(0, 3).map(c => (
                            <span key={c} className="company-pill">{c}</span>
                          ))}
                          {p.companies.length > 3 && (
                            <span className="company-more">+{p.companies.length - 3}</span>
                          )}
                        </div>
                      </div>

                      <div className="td action-td">
                        <Link to={`/practice/${p.slug}`} className={`btn btn-sm ${isSolved ? 'btn-secondary' : 'btn-primary'}`}>
                          <span>{isSolved ? 'Solve Again' : 'Solve'}</span>
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: CURATED SDE SHEETS & ROADMAPS */}
      {activeTab === 'tracks' && (
        <div className="tracks-container">
          <div className="section-intro">
            <h2>DataDrix Curated <span className="text-gradient">SDE Preparation Tracks</span></h2>
            <p>Targeted problem sheets carefully designed for FAANG, product giants, and rapid interview revision.</p>
          </div>

          <div className="tracks-grid">
            {DATADRIX_TRACKS.map(track => {
              const totalInTrack = track.problemSlugs.length;
              const solvedInTrack = track.problemSlugs.filter(s => solvedList.includes(s)).length;
              const pct = Math.round((solvedInTrack / totalInTrack) * 100);

              return (
                <div key={track.id} className="track-card glass-panel">
                  <div className="track-card-header">
                    <span className="track-badge-tag">{track.badge}</span>
                    <span className="track-pct">{pct}% Done</span>
                  </div>

                  <h3 className="track-card-title">{track.title}</h3>
                  <p className="track-card-sub">{track.subtitle}</p>

                  {/* Progress Bar */}
                  <div className="track-progress-wrap">
                    <div className="track-progress-bar" style={{ width: `${pct}%`, background: track.color }} />
                  </div>
                  <div className="track-progress-info">
                    <span>{solvedInTrack} of {totalInTrack} Solved</span>
                    <span>{totalInTrack - solvedInTrack} Remaining</span>
                  </div>

                  <div className="track-card-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm w-full"
                      onClick={() => {
                        setSelectedTrack(track.id);
                        setActiveTab('arena');
                      }}
                    >
                      <span>Start This Sheet</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: REAL INTERVIEW EXPERIENCES */}
      {activeTab === 'experiences' && (
        <div className="experiences-container">
          <div className="section-intro">
            <h2>Real Tech <span className="text-gradient">Interview Experiences</span></h2>
            <p>Authentic candidate journeys, round-by-round breakdown, coding problems, and preparation strategies from recent hiring loops.</p>
          </div>

          <div className="exp-list">
            {DATADRIX_INTERVIEW_EXPERIENCES.map(exp => {
              const isExpanded = expandedExpId === exp.id;
              return (
                <div key={exp.id} className={`exp-card glass-panel ${isExpanded ? 'expanded' : ''}`}>
                  <div
                    className="exp-card-header"
                    onClick={() => setExpandedExpId(isExpanded ? null : exp.id)}
                  >
                    <div className="exp-meta-left">
                      <span className="company-logo-badge">{exp.company}</span>
                      <div>
                        <h3 className="exp-title">{exp.role}</h3>
                        <div className="exp-sub">
                          <span>📍 {exp.location}</span>
                          <span>• {exp.date}</span>
                          <span>• Comp: {exp.compensation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="exp-meta-right">
                      <span className="verdict-pill verdict-selected">
                        <Check size={13} /> {exp.verdict}
                      </span>
                      <span className={`diff-pill diff-${exp.difficulty.toLowerCase().includes('hard') ? 'hard' : 'medium'}`}>
                        {exp.difficulty}
                      </span>
                      <button type="button" className="expand-chevron">
                        <ChevronRight size={18} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="exp-card-body">
                      <h4 className="rounds-heading">Interview Rounds Breakdown:</h4>
                      <div className="rounds-timeline">
                        {exp.rounds.map((round, rIdx) => (
                          <div key={rIdx} className="round-step">
                            <div className="round-marker">{rIdx + 1}</div>
                            <div className="round-content">
                              <h5 className="round-name">{round.name}</h5>
                              <p className="round-detail">{round.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="exp-tips-box">
                        <strong>💡 Key Interview Tip:</strong> {exp.keyTips}
                      </div>

                      {exp.relatedProblems && exp.relatedProblems.length > 0 && (
                        <div className="exp-problems-row">
                          <span className="exp-prob-label">Practice Questions Asked in this Interview:</span>
                          <div className="exp-prob-tags">
                            {exp.relatedProblems.map(slug => {
                              const prob = PROBLEMS_CATALOG.find(p => p.slug === slug);
                              if (!prob) return null;
                              return (
                                <Link
                                  key={slug}
                                  to={`/practice/${slug}`}
                                  className="btn btn-secondary btn-sm exp-prob-link"
                                >
                                  <Code2 size={13} color="#818cf8" />
                                  <span>{prob.title}</span>
                                  <ArrowRight size={13} />
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: DATA-DRIX CONTESTS & JOB-A-THON HIRING CHALLENGES */}
      {activeTab === 'contests' && (
        <div className="contests-container">
          {/* Active Virtual Contest Arena View */}
          {activeVirtualContest ? (
            <div className="virtual-arena-wrapper glass-panel">
              {/* Virtual Contest Header Bar */}
              <div className="virtual-arena-header">
                <div className="arena-title-info">
                  <div className="arena-status-pill">
                    <span className="live-dot" />
                    <span>VIRTUAL CONTEST IN PROGRESS</span>
                  </div>
                  <h2 className="arena-contest-title">{activeVirtualContest.title}</h2>
                  <span className="arena-contest-type">{activeVirtualContest.type} • Total {activeVirtualContest.totalScore} Points</span>
                </div>

                <div className="arena-timer-box">
                  <span className="timer-label">Time Remaining</span>
                  <div className={`digital-timer ${virtualContestSeconds < 600 ? 'timer-warning' : ''}`}>
                    <Clock size={18} />
                    <span>{formatContestTime(virtualContestSeconds)}</span>
                  </div>
                </div>

                <div className="arena-header-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsVirtualContestActive(!isVirtualContestActive)}
                    title={isVirtualContestActive ? 'Pause Contest Timer' : 'Resume Timer'}
                  >
                    {isVirtualContestActive ? <Pause size={14} /> : <Play size={14} />}
                    <span>{isVirtualContestActive ? 'Pause' : 'Resume'}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm finish-contest-btn"
                    onClick={finishVirtualContest}
                  >
                    <Flag size={14} />
                    <span>Submit Contest</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to exit the virtual contest?')) {
                        setActiveVirtualContest(null);
                        setIsVirtualContestActive(false);
                      }
                    }}
                  >
                    <X size={14} />
                    <span>Exit Arena</span>
                  </button>
                </div>
              </div>

              {/* Contest HUD Metric Strip */}
              <div className="contest-hud-strip">
                <div className="hud-metric">
                  <span className="hud-label">Your Contest Score</span>
                  <span className="hud-val text-gradient">
                    {activeVirtualContest.problems.reduce((acc, p) => contestSolved.includes(p.slug) ? acc + p.points : acc, 0)} / {activeVirtualContest.totalScore} pts
                  </span>
                </div>
                <div className="hud-metric">
                  <span className="hud-label">Solved Problems</span>
                  <span className="hud-val">{contestSolved.length} / {activeVirtualContest.problems.length} Accepted</span>
                </div>
                <div className="hud-metric">
                  <span className="hud-label">Penalty Time</span>
                  <span className="hud-val" style={{ color: '#f59e0b' }}>+{contestPenaltyMinutes} mins</span>
                </div>
                <div className="hud-metric">
                  <span className="hud-label">Simulated Competitors</span>
                  <span className="hud-val" style={{ color: '#34d399' }}>15,420 Active Coders</span>
                </div>
              </div>

              {/* Main Split: Left Problems Board vs Right Live Leaderboard */}
              <div className="arena-split-grid">
                {/* Problems Board */}
                <div className="arena-problems-column">
                  <h3 className="column-title">
                    <Target size={16} color="#818cf8" />
                    <span>Contest Problem Set</span>
                  </h3>

                  <div className="contest-problems-list">
                    {activeVirtualContest.problems.map((p, pIdx) => {
                      const isProblemSolved = contestSolved.includes(p.slug);
                      return (
                        <div key={p.slug} className={`contest-problem-card ${isProblemSolved ? 'solved' : ''}`}>
                          <div className="contest-prob-left">
                            <div className="prob-number-badge">P{pIdx + 1}</div>
                            <div className="prob-info-block">
                              <h4 className="contest-prob-title">{p.title}</h4>
                              <div className="contest-prob-meta">
                                <span className={`diff-pill diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                                <span className="time-pill"><Clock size={12} /> {p.time}</span>
                                <span className="pts-pill">+{p.points} Points</span>
                              </div>
                            </div>
                          </div>

                          <div className="contest-prob-right">
                            {isProblemSolved ? (
                              <span className="contest-accepted-badge">
                                <CheckCircle2 size={16} /> Accepted
                              </span>
                            ) : (
                              <div className="contest-prob-actions">
                                <Link
                                  to={`/practice/${p.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-secondary btn-sm"
                                  title="Open in Full IDE Solver with Test Runner"
                                >
                                  <span>Solve in IDE</span>
                                  <ArrowUpRight size={13} />
                                </Link>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() => markContestProblemSolved(p.slug, p.points)}
                                >
                                  <CheckSquare size={13} />
                                  <span>Mark Accepted</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated Real-Time Leaderboard */}
                <div className="arena-leaderboard-column">
                  <div className="live-leaderboard-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Trophy size={16} color="#f59e0b" />
                      <h3 className="column-title" style={{ margin: 0 }}>Live Contest Standings</h3>
                    </div>
                    <span className="live-pulse-tag">● Live Simulation</span>
                  </div>

                  <div className="simulated-ranks-list">
                    {/* User's dynamic position row */}
                    {(() => {
                      const userScore = activeVirtualContest.problems.reduce((acc, p) => contestSolved.includes(p.slug) ? acc + p.points : acc, 0);
                      const higherCount = simulatedCompetitors.filter(c => c.score > userScore).length;
                      const userRank = higherCount + 1;
                      return (
                        <div className="live-rank-row user-rank-highlight">
                          <span className="live-rank-num">#{userRank}</span>
                          <div className="live-user-info">
                            <span className="live-user-name">You (Nitin Verma) 👑</span>
                            <span className="live-user-inst">Datadrix Tech Org</span>
                          </div>
                          <div className="live-user-score">
                            <span className="live-score-pts">{userScore} pts</span>
                            <span className="live-solved-cnt">{contestSolved.length} solved</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Competitors List */}
                    {simulatedCompetitors.map((comp, cIdx) => (
                      <div key={comp.name} className="live-rank-row">
                        <span className="live-rank-num">#{cIdx + 2}</span>
                        <div className="live-user-info">
                          <span className="live-user-name">@{comp.name}</span>
                          <span className="live-user-inst">{comp.institute}</span>
                        </div>
                        <div className="live-user-score">
                          <span className="live-score-pts">{comp.score} pts</span>
                          <span className="live-solved-cnt">{comp.solvedCount} solved</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contest Summary Modal */}
              {contestSummary && (
                <div className="modal-backdrop" onClick={() => setContestSummary(null)}>
                  <div className="contest-scorecard-modal glass-panel" onClick={e => e.stopPropagation()}>
                    <div className="scorecard-top-icon">
                      <Trophy size={48} color="#f59e0b" />
                    </div>
                    <h2 className="scorecard-title">Virtual Contest Completed!</h2>
                    <p className="scorecard-sub">{contestSummary.contestTitle}</p>

                    <div className="scorecard-stats-grid">
                      <div className="scorecard-box">
                        <span className="box-label">Final Score</span>
                        <span className="box-val text-gradient">{contestSummary.myScore} / {contestSummary.totalPossible}</span>
                      </div>
                      <div className="scorecard-box">
                        <span className="box-label">Global Rank</span>
                        <span className="box-val" style={{ color: '#38bdf8' }}>#{contestSummary.rank}</span>
                      </div>
                      <div className="scorecard-box">
                        <span className="box-label">Rating Change</span>
                        <span className="box-val" style={{ color: '#34d399' }}>+{contestSummary.ratingDelta} Δ</span>
                      </div>
                      <div className="scorecard-box">
                        <span className="box-label">Percentile</span>
                        <span className="box-val" style={{ color: '#a78bfa' }}>{contestSummary.percentile}</span>
                      </div>
                    </div>

                    <div className="scorecard-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          setContestSummary(null);
                          setActiveVirtualContest(null);
                        }}
                      >
                        Return to Contests Arena
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Normal Contests List View */
            <div className="contests-hub-view">
              <div className="section-intro">
                <div className="intro-badge">
                  <Trophy size={14} color="#f59e0b" />
                  <span>DATADRIX COMPETITIVE ARENA & HIRING CHALLENGES</span>
                </div>
                <h2>Weekly Rated Contests & Job-A-Thon Fast-Tracks</h2>
                <p>
                  Compete in live, timed algorithmic contests against thousands of developers worldwide. Build your coding rating, earn verified certifications, and win direct interview fast-tracks to top tech product firms.
                </p>
              </div>

              {/* Contest Filter Pills */}
              <div className="contest-filter-chips">
                {[
                  { id: 'all', label: 'All Contests' },
                  { id: 'live', label: 'Live & Virtual Open' },
                  { id: 'upcoming', label: 'Hiring Fast-Tracks' },
                  { id: 'past', label: 'Past Archives' }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    className={`contest-filter-btn ${contestFilter === f.id ? 'active' : ''}`}
                    onClick={() => setContestFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Contests Cards Grid */}
              <div className="contests-cards-grid">
                {DATADRIX_CONTESTS.filter(c => contestFilter === 'all' || (contestFilter === 'live' && (c.status === 'live' || c.status === 'past')) || c.status === contestFilter).map(contest => {
                  const isRegistered = registeredContestIds.includes(contest.id);
                  return (
                    <div key={contest.id} className="contest-card glass-panel">
                      <div className="contest-card-header">
                        <div className="contest-badge-row">
                          <span className={`contest-status-pill status-${contest.status}`}>
                            {contest.status === 'live' ? '● LIVE NOW' : contest.status === 'upcoming' ? 'UPCOMING' : 'ARCHIVED'}
                          </span>
                          <span className="contest-type-badge">{contest.badge}</span>
                        </div>
                        <h3 className="contest-title">{contest.title}</h3>
                        <p className="contest-tagline">{contest.tagline}</p>
                      </div>

                      <div className="contest-meta-grid">
                        <div className="meta-box">
                          <Clock size={14} color="#818cf8" />
                          <span><strong>Duration:</strong> {contest.duration}</span>
                        </div>
                        <div className="meta-box">
                          <Calendar size={14} color="#34d399" />
                          <span><strong>Schedule:</strong> {contest.startTime}</span>
                        </div>
                        <div className="meta-box">
                          <Users size={14} color="#38bdf8" />
                          <span><strong>Participants:</strong> {contest.registeredCount.toLocaleString()} Coders</span>
                        </div>
                        <div className="meta-box">
                          <Award size={14} color="#f59e0b" />
                          <span><strong>Max Score:</strong> {contest.totalScore} Pts</span>
                        </div>
                      </div>

                      {/* Sponsoring Companies if any */}
                      {contest.companies && (
                        <div className="contest-companies-row">
                          <span className="companies-label">Hiring Partners:</span>
                          <div className="company-pills-row">
                            {contest.companies.map(comp => (
                              <span key={comp} className="company-pill">{comp}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Problems Preview List */}
                      <div className="contest-problems-preview">
                        <span className="preview-label">Problem Set ({contest.problems.length} Challenges):</span>
                        <div className="prob-chips-wrap">
                          {contest.problems.map((p, i) => (
                            <span key={p.slug} className="prob-preview-chip">
                              <strong>P{i + 1}:</strong> {p.title} ({p.points} pts)
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Prizes Box */}
                      {contest.prizes && (
                        <div className="contest-prizes-box">
                          <span className="prizes-heading">🏆 Top Rewards & Perks:</span>
                          <ul className="prizes-list">
                            {contest.prizes.map((prize, pIdx) => (
                              <li key={pIdx}>{prize}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="contest-card-footer">
                        {contest.status === 'live' || contest.status === 'past' ? (
                          <button
                            type="button"
                            className="btn btn-primary contest-action-btn"
                            onClick={() => startVirtualContest(contest)}
                          >
                            <Play size={16} />
                            <span>Enter Virtual Contest Arena</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`btn ${isRegistered ? 'btn-secondary' : 'btn-primary'} contest-action-btn`}
                            onClick={() => toggleRegisterContest(contest.id)}
                          >
                            {isRegistered ? <Check size={16} color="#34d399" /> : <Calendar size={16} />}
                            <span>{isRegistered ? 'Registered (Reminder Set ✅)' : 'Register for Free'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: COMPANY INTERVIEW PREP HUB & TOPIC DISTRIBUTION */}
      {activeTab === 'company-kits' && (
        <div className="company-kits-container">
          <div className="section-intro">
            <div className="intro-badge">
              <Briefcase size={14} color="#3b82f6" />
              <span>TIER-1 FAANG / PRODUCT HIRING KITS</span>
            </div>
            <h2>Company-Specific Coding Roadmaps & Interview Deep Dives</h2>
            <p>
              Targeted DSA interview preparation for Amazon, Google, Microsoft, Meta, and Flipkart. Inspect topic distribution percentages, multi-round selection pipelines, and the most frequently asked problems.
            </p>
          </div>

          {/* Company Picker Cards */}
          <div className="company-selector-grid">
            {DATADRIX_COMPANY_KITS.map(kit => (
              <button
                key={kit.id}
                type="button"
                className={`company-select-card glass-panel ${selectedCompanyKit === kit.id ? 'active' : ''}`}
                style={{ '--company-accent': kit.color }}
                onClick={() => setSelectedCompanyKit(kit.id)}
              >
                <div className="company-card-top">
                  <span className="company-logo-avatar" style={{ background: `${kit.color}22`, color: kit.color }}>
                    {kit.name[0]}
                  </span>
                  <span className="company-badge-tag">{kit.badge}</span>
                </div>
                <h3 className="company-select-name">{kit.name}</h3>
                <span className="company-comp-pill">{kit.compensation}</span>
              </button>
            ))}
          </div>

          {/* Active Company Comprehensive Dashboard */}
          {(() => {
            const kit = DATADRIX_COMPANY_KITS.find(k => k.id === selectedCompanyKit) || DATADRIX_COMPANY_KITS[0];
            return (
              <div className="active-company-dashboard glass-panel">
                <div className="dashboard-header-row" style={{ borderLeftColor: kit.color }}>
                  <div className="dash-title-left">
                    <span className="dash-company-badge" style={{ background: kit.color }}>{kit.name} SDE Career Track</span>
                    <h2 className="dash-company-name">{kit.name} Interview Kit</h2>
                    <p className="dash-tagline">“{kit.tagline}”</p>
                  </div>
                  <div className="dash-comp-box">
                    <span className="comp-label">Typical SDE CTC Package</span>
                    <span className="comp-val" style={{ color: kit.color }}>{kit.compensation}</span>
                  </div>
                </div>

                {/* 4-Round Selection Pipeline */}
                <div className="dash-section">
                  <h3 className="dash-section-title">
                    <Layers size={17} color="#818cf8" />
                    <span>Recruitment Rounds Breakdown</span>
                  </h3>
                  <div className="rounds-timeline-grid">
                    {kit.rounds.map((round, rIdx) => (
                      <div key={rIdx} className="round-pipeline-card">
                        <div className="round-num-circle" style={{ background: kit.color }}>{rIdx + 1}</div>
                        <h4 className="pipeline-round-name">{round.name}</h4>
                        <p className="pipeline-round-desc">{round.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topic Distribution Progress Bars */}
                <div className="dash-section">
                  <h3 className="dash-section-title">
                    <BarChart3 size={17} color="#34d399" />
                    <span>Algorithmic Topic Distribution (%)</span>
                  </h3>
                  <div className="topic-bars-grid">
                    {kit.topicDistribution.map((t, tIdx) => (
                      <div key={tIdx} className="topic-bar-row">
                        <div className="topic-bar-info">
                          <span className="topic-name">{t.topic}</span>
                          <span className="topic-pct-num" style={{ color: t.color }}>{t.pct}%</span>
                        </div>
                        <div className="topic-bar-track">
                          <div
                            className="topic-bar-fill"
                            style={{
                              width: `${t.pct}%`,
                              background: t.color,
                              boxShadow: `0 0 10px ${t.color}55`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Most Frequent Interview Problems */}
                <div className="dash-section">
                  <h3 className="dash-section-title">
                    <Code2 size={17} color="#f59e0b" />
                    <span>Most Frequently Asked Questions at {kit.name}</span>
                  </h3>
                  <div className="frequent-problems-grid">
                    {kit.frequentProblems.map(slug => {
                      const prob = PROBLEMS_CATALOG.find(p => p.slug === slug);
                      if (!prob) return null;
                      const isProbSolved = solvedList.includes(prob.slug);
                      return (
                        <div key={prob.slug} className="frequent-prob-card">
                          <div className="freq-card-header">
                            <span className="freq-category">{prob.category}</span>
                            <span className={`diff-pill diff-${prob.difficulty.toLowerCase()}`}>{prob.difficulty}</span>
                          </div>
                          <h4 className="freq-prob-title">{prob.title}</h4>
                          <div className="freq-meta-row">
                            <span>Accuracy: {prob.accuracy}</span>
                            <span>Points: +{prob.points}</span>
                          </div>
                          <Link
                            to={`/practice/${prob.slug}`}
                            className={`btn btn-sm ${isProbSolved ? 'btn-secondary' : 'btn-primary'} freq-solve-btn`}
                          >
                            <span>{isProbSolved ? 'Review Code' : 'Solve Challenge'}</span>
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Behavioral & Leadership Tips */}
                <div className="dash-section behavioral-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Brain size={18} color="#a78bfa" />
                    <h4 style={{ margin: 0, color: '#e0e7ff', fontSize: '1rem', fontWeight: 700 }}>
                      Insider Cultural & Behavioral Preparation
                    </h4>
                  </div>
                  <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {kit.behavioralTip}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 6: DATADRIX GLOBAL LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="leaderboard-container">
          <div className="section-intro">
            <div className="intro-badge">
              <Medal size={14} color="#10b981" />
              <span>GLOBAL COMPETITIVE CODING STANDINGS</span>
            </div>
            <h2>Coder Rating Hall of Fame & National Rankings</h2>
            <p>
              Track global leaderboards by Coder Rating, problem counts, and streak consistency. Filter by top Indian engineering institutions and world universities.
            </p>
          </div>

          {/* Top 3 Metric Highlights */}
          <div className="leaderboard-hero-metrics">
            <div className="hero-metric-card glass-panel">
              <div className="metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <Trophy size={24} />
              </div>
              <div className="metric-data">
                <span className="metric-sub">Rank #1 Global Coder</span>
                <span className="metric-head">Ananya Sharma (2,842)</span>
                <span className="metric-extra">IIT Bombay • 894 Solved</span>
              </div>
            </div>
            <div className="hero-metric-card glass-panel">
              <div className="metric-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <Users size={24} />
              </div>
              <div className="metric-data">
                <span className="metric-sub">Active Global Coders</span>
                <span className="metric-head">48,250+ Programmers</span>
                <span className="metric-extra">Across 420+ Colleges</span>
              </div>
            </div>
            <div className="hero-metric-card glass-panel">
              <div className="metric-icon-wrap" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
                <Zap size={24} />
              </div>
              <div className="metric-data">
                <span className="metric-sub">Solutions Evaluated Today</span>
                <span className="metric-head">14,890 Test Runs</span>
                <span className="metric-extra">99.98% Accuracy Rate</span>
              </div>
            </div>
          </div>

          {/* User's Pinned Standing Card */}
          <div className="user-standing-card glass-panel">
            <div className="user-standing-left">
              <div className="standing-avatar">NV</div>
              <div className="standing-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 className="standing-name">You (Nitin Verma)</h3>
                  <span className="standing-pill">Specialist Tier 🟢</span>
                </div>
                <span className="standing-handle">@nitin_coder • Datadrix Org</span>
              </div>
            </div>

            <div className="user-standing-right">
              <div className="standing-stat">
                <span className="stat-label">Global Rank</span>
                <span className="stat-val" style={{ color: '#f59e0b' }}>#138</span>
              </div>
              <div className="standing-stat">
                <span className="stat-label">Coder Rating</span>
                <span className="stat-val text-gradient">2,280</span>
              </div>
              <div className="standing-stat">
                <span className="stat-label">Problems Solved</span>
                <span className="stat-val">{solvedList.length} / {PROBLEMS_CATALOG.length}</span>
              </div>
              <div className="standing-stat">
                <span className="stat-label">Next Tier</span>
                <span className="stat-val" style={{ color: '#818cf8' }}>Master (120 pts to go)</span>
              </div>
            </div>
          </div>

          {/* Filters Row: Search & Institute */}
          <div className="leaderboard-filters-row glass-panel">
            <div className="search-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search coder by username or handle..."
                value={leaderboardSearch}
                onChange={e => setLeaderboardSearch(e.target.value)}
                className="leaderboard-search-input"
              />
            </div>

            <div className="institute-select-wrap">
              <Building size={14} className="inst-icon" />
              <select
                value={leaderboardInstitute}
                onChange={e => setLeaderboardInstitute(e.target.value)}
                className="institute-dropdown"
              >
                <option value="all">All Universities & Institutes</option>
                <option value="IIT Bombay">IIT Bombay</option>
                <option value="DTU Delhi">DTU Delhi</option>
                <option value="BITS Pilani">BITS Pilani</option>
                <option value="IIIT Hyderabad">IIIT Hyderabad</option>
                <option value="NIT Trichy">NIT Trichy</option>
                <option value="NSUT Delhi">NSUT Delhi</option>
                <option value="IIT Kharagpur">IIT Kharagpur</option>
                <option value="IIT Madras">IIT Madras</option>
                <option value="UC Berkeley">UC Berkeley</option>
                <option value="Jamia Millia">Jamia Millia</option>
              </select>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="leaderboard-table-card glass-panel">
            <div className="lb-table-head">
              <span className="th col-rank">Rank</span>
              <span className="th col-coder">Top Coder</span>
              <span className="th col-inst">University / Institute</span>
              <span className="th col-rating">Rating & Tier</span>
              <span className="th col-solved">Solved</span>
              <span className="th col-streak">Streak</span>
              <span className="th col-podiums">Podiums</span>
            </div>

            <div className="lb-table-body">
              {filteredLeaderboard.map((coder) => {
                const isTop3 = coder.rank <= 3;
                const tierColor = coder.tier === 'Grandmaster' ? '#ef4444' : coder.tier === 'Candidate Master' ? '#f59e0b' : coder.tier === 'Master' ? '#3b82f6' : '#10b981';
                return (
                  <div key={coder.handle} className={`lb-table-row ${isTop3 ? 'top-rank-row' : ''}`}>
                    <div className="td col-rank">
                      {coder.rank === 1 ? (
                        <span className="medal-badge gold">🥇 1</span>
                      ) : coder.rank === 2 ? (
                        <span className="medal-badge silver">🥈 2</span>
                      ) : coder.rank === 3 ? (
                        <span className="medal-badge bronze">🥉 3</span>
                      ) : (
                        <span className="rank-num">#{coder.rank}</span>
                      )}
                    </div>

                    <div className="td col-coder">
                      <div className="coder-avatar" style={{ background: `${tierColor}25`, color: tierColor }}>
                        {coder.avatar}
                      </div>
                      <div className="coder-names">
                        <span className="coder-display-name">{coder.name}</span>
                        <span className="coder-handle">@{coder.handle} • {coder.country}</span>
                      </div>
                    </div>

                    <div className="td col-inst">
                      <span className="institute-pill">{coder.institute}</span>
                    </div>

                    <div className="td col-rating">
                      <span className="rating-val" style={{ color: tierColor }}>{coder.rating}</span>
                      <span className="tier-badge" style={{ background: `${tierColor}20`, color: tierColor }}>
                        {coder.tier}
                      </span>
                    </div>

                    <div className="td col-solved">
                      <span className="solved-pill">{coder.solvedCount} Solved</span>
                    </div>

                    <div className="td col-streak">
                      <span className="streak-tag">
                        <Flame size={13} color="#f97316" /> {coder.streak}d
                      </span>
                    </div>

                    <div className="td col-podiums">
                      <span className="podium-count">🏆 {coder.podiums}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {showCheatSheet && (
        <div className="modal-backdrop" onClick={() => setShowCheatSheet(false)}>
          <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="#818cf8" />
                <h3>DataDrix Big-O Complexity & 14 Universal DSA Patterns</h3>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowCheatSheet(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <h4>1. Standard Data Structure Time Complexities</h4>
              <table className="cheat-table">
                <thead>
                  <tr>
                    <th>Data Structure</th>
                    <th>Access</th>
                    <th>Search</th>
                    <th>Insertion</th>
                    <th>Deletion</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Array / Vector</strong></td>
                    <td>O(1)</td>
                    <td>O(N)</td>
                    <td>O(N)</td>
                    <td>O(N)</td>
                  </tr>
                  <tr>
                    <td><strong>Hash Table / Map</strong></td>
                    <td>N/A</td>
                    <td>O(1) avg</td>
                    <td>O(1) avg</td>
                    <td>O(1) avg</td>
                  </tr>
                  <tr>
                    <td><strong>Binary Search Tree</strong></td>
                    <td>O(log N)</td>
                    <td>O(log N)</td>
                    <td>O(log N)</td>
                    <td>O(log N)</td>
                  </tr>
                  <tr>
                    <td><strong>Stack & Queue</strong></td>
                    <td>O(N)</td>
                    <td>O(N)</td>
                    <td>O(1)</td>
                    <td>O(1)</td>
                  </tr>
                </tbody>
              </table>

              <h4 style={{ marginTop: '20px' }}>2. The 14 Must-Know Algorithmic Patterns</h4>
              <div className="patterns-grid">
                <div className="pattern-box">
                  <strong>1. Sliding Window</strong>
                  <p>Subarray problems, maximum sum of size K, longest substring with distinct characters.</p>
                </div>
                <div className="pattern-box">
                  <strong>2. Two Pointers</strong>
                  <p>Sorted arrays, finding pairs/triplets, reversing strings, trapping rain water.</p>
                </div>
                <div className="pattern-box">
                  <strong>3. Fast & Slow Pointers</strong>
                  <p>Linked list cycle detection, finding middle element, happy number.</p>
                </div>
                <div className="pattern-box">
                  <strong>4. Monotonic Stack</strong>
                  <p>Next Greater Element, Daily Temperatures, Largest Rectangle in Histogram.</p>
                </div>
                <div className="pattern-box">
                  <strong>5. Modified Binary Search</strong>
                  <p>Rotated sorted arrays, peak finding, search in infinite array.</p>
                </div>
                <div className="pattern-box">
                  <strong>6. 0/1 & Unbounded Knapsack</strong>
                  <p>Subset sum, Coin Change, partition equal subset sum.</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowCheatSheet(false)}
              >
                Close Cheat Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Page Styling */}
      <style>{`
        @keyframes flame-pulse {
          0%, 100% { transform: scale(1) rotate(-1deg); filter: drop-shadow(0 0 4px rgba(249, 115, 22, 0.5)); }
          50% { transform: scale(1.15) rotate(2deg); filter: drop-shadow(0 0 10px rgba(249, 115, 22, 0.8)); }
        }
        @keyframes progress-stripes {
          from { background-position: 1rem 0; }
          to { background-position: 0 0; }
        }
        @keyframes ambient-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }

        .datadrix-practice-page {
          max-width: 1320px;
          margin: 0 auto;
          padding: 24px 20px 80px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          position: relative;
        }

        /* Hero Card */
        .practice-hero-card {
          position: relative;
          padding: 36px 32px;
          border-radius: var(--radius-xl);
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.8) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }
        .practice-hero-card::before {
          content: '';
          position: absolute;
          top: -100px;
          right: -100px;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
          pointer-events: none;
          animation: ambient-pulse 6s ease-in-out infinite;
        }

        .hero-top-row {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 32px;
          flex-wrap: wrap;
          z-index: 1;
        }
        .hero-title-area {
          flex: 1;
          min-width: 320px;
        }
        .datadrix-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.35);
          box-shadow: 0 0 16px rgba(16, 185, 129, 0.2);
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          margin-bottom: 14px;
        }
        .hero-title-area h1 {
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          margin: 0 0 12px 0;
          line-height: 1.15;
        }
        .hero-desc {
          color: var(--text-secondary);
          font-size: 0.96rem;
          line-height: 1.65;
          max-width: 640px;
          margin: 0 0 22px 0;
        }
        .hero-quick-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* Coder Scorecard */
        .coder-scorecard {
          background: linear-gradient(135deg, rgba(20, 27, 45, 0.85) 0%, rgba(13, 18, 30, 0.95) 100%);
          border: 1px solid rgba(129, 140, 248, 0.3);
          border-radius: var(--radius-xl);
          padding: 22px 24px;
          min-width: 340px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.5), 0 0 24px rgba(99, 102, 241, 0.15);
        }
        .scorecard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .scorecard-rank {
          display: flex;
          flex-direction: column;
        }
        .rank-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .rank-val {
          font-size: 1rem;
          font-weight: 800;
          color: #c7d2fe;
          text-shadow: 0 0 12px rgba(165, 180, 252, 0.3);
        }
        .streak-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          background: rgba(249, 115, 22, 0.15);
          color: #fb923c;
          border: 1px solid rgba(249, 115, 22, 0.4);
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 800;
          box-shadow: 0 0 16px rgba(249, 115, 22, 0.25);
        }
        .streak-pill svg {
          animation: flame-pulse 2s ease-in-out infinite;
        }
        .scorecard-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          background: rgba(0, 0, 0, 0.35);
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .scorecard-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .stat-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .stat-num {
          font-size: 1.25rem;
          font-weight: 800;
        }
        .stat-num small {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* 30-Day Activity Heatmap */
        .heatmap-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .heatmap-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .heatmap-active-tag {
          color: #10b981;
          font-weight: 700;
        }
        .heatmap-grid {
          display: grid;
          grid-template-columns: repeat(15, 1fr);
          gap: 5px;
          background: rgba(0, 0, 0, 0.2);
          padding: 8px 10px;
          border-radius: 8px;
        }
        .heatmap-box {
          height: 13px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .heatmap-box:hover {
          transform: scale(1.35);
          z-index: 2;
        }
        .heatmap-box.active {
          background: #10b981;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.7);
        }

        /* POTD Banner */
        .potd-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(99, 102, 241, 0.15) 50%, rgba(16, 185, 129, 0.08) 100%);
          border: 1px solid rgba(249, 115, 22, 0.35);
          box-shadow: 0 14px 36px -8px rgba(249, 115, 22, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-xl);
          gap: 24px;
          flex-wrap: wrap;
          position: relative;
          overflow: hidden;
        }
        .potd-badge-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .potd-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #f97316;
          background: rgba(249, 115, 22, 0.18);
          border: 1px solid rgba(249, 115, 22, 0.4);
          padding: 4px 10px;
          border-radius: 6px;
        }
        .potd-pill svg {
          animation: flame-pulse 2s ease-in-out infinite;
        }
        .potd-bonus {
          font-size: 0.76rem;
          color: #fbbf24;
          font-weight: 800;
          background: rgba(245, 158, 11, 0.15);
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .potd-solved-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #10b981;
          background: rgba(16, 185, 129, 0.18);
          border: 1px solid rgba(16, 185, 129, 0.35);
          padding: 4px 10px;
          border-radius: 6px;
        }
        .potd-title {
          font-size: 1.4rem;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: var(--text-primary);
        }
        .potd-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0 0 14px 0;
          max-width: 650px;
          line-height: 1.5;
        }
        .potd-tags {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .potd-tag {
          font-size: 0.76rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.08);
          padding: 3px 10px;
          border-radius: 6px;
          color: var(--text-secondary);
        }
        .company-tag {
          font-size: 0.74rem;
          font-weight: 600;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: #a5b4fc;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .potd-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }
        .potd-countdown {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #cbd5e1;
          font-family: monospace;
          background: rgba(0, 0, 0, 0.3);
          padding: 4px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .potd-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 11px 22px;
          font-size: 0.94rem;
          font-weight: 700;
          border-radius: 10px;
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .potd-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 26px rgba(99, 102, 241, 0.55);
        }
        .potd-cta-btn svg {
          transition: transform 0.2s;
        }
        .potd-cta-btn:hover svg {
          transform: translateX(4px);
        }

        /* Practice Nav Tabs */
        .practice-nav-tabs {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 14px;
          overflow-x: auto;
        }
        .nav-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-secondary);
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.92rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }
        .nav-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }
        .nav-tab-btn.active {
          color: #fff;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3));
          border-color: rgba(129, 140, 248, 0.6);
          box-shadow: 0 4px 18px rgba(99, 102, 241, 0.35);
        }

        /* Active Track Banner */
        .active-track-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 22px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
          border: 1px solid rgba(99, 102, 241, 0.4);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
          border-radius: 12px;
        }
        .track-badge {
          font-size: 0.74rem;
          text-transform: uppercase;
          background: #6366f1;
          color: white;
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: 800;
          letter-spacing: 0.04em;
          margin-right: 10px;
        }
        .track-title {
          font-weight: 800;
          font-size: 1rem;
        }

        /* Filter Card */
        .practice-filter-card {
          padding: 20px 24px;
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .company-filter-row {
          display: flex;
          align-items: center;
          gap: 14px;
          overflow-x: auto;
          padding-bottom: 6px;
        }
        .filter-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 0.82rem;
          color: var(--text-muted);
          font-weight: 700;
          white-space: nowrap;
        }
        .company-pills-scroll {
          display: flex;
          gap: 9px;
        }
        .company-chip {
          padding: 5px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .company-chip:hover {
          border-color: rgba(99, 102, 241, 0.45);
          color: var(--text-primary);
          transform: translateY(-1px);
        }
        .company-chip.active {
          background: #6366f1;
          color: #fff;
          border-color: #6366f1;
          font-weight: 700;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
        }
        .controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .search-box-wrap {
          position: relative;
          flex: 1;
          min-width: 260px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .search-input {
          width: 100%;
          padding: 10px 38px 10px 40px;
          border-radius: 10px;
          background: rgba(10, 14, 24, 0.7);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .search-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 16px rgba(99, 102, 241, 0.25);
        }
        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .filter-selects {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .filter-select {
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(10, 14, 24, 0.7);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .filter-select:focus {
          outline: none;
          border-color: #6366f1;
        }

        /* Problems Table */
        .problems-table-wrapper {
          border-radius: var(--radius-xl);
          overflow: hidden;
          background: rgba(13, 18, 30, 0.75);
          box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.5);
        }
        .table-header-row {
          display: grid;
          grid-template-columns: 80px 2.2fr 1.1fr 105px 95px 95px 1.5fr 125px;
          padding: 14px 20px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .table-row {
          display: grid;
          grid-template-columns: 80px 2.2fr 1.1fr 105px 95px 95px 1.5fr 125px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          align-items: center;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .table-row:hover {
          background: rgba(255, 255, 255, 0.04);
          transform: translateY(-1px);
        }
        .row-solved {
          background: rgba(16, 185, 129, 0.03);
        }
        .status-td {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .star-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 3px;
          display: flex;
          align-items: center;
          transition: transform 0.15s;
        }
        .star-btn:hover {
          transform: scale(1.25);
        }
        .problem-link {
          font-weight: 700;
          color: var(--text-primary);
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.15s;
        }
        .problem-link:hover {
          color: #818cf8;
        }
        .mobile-tags {
          display: none;
        }
        .diff-pill {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.74rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .diff-basic {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.35);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.15);
        }
        .diff-easy {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.35);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.15);
        }
        .diff-medium {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.35);
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.15);
        }
        .diff-hard {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.35);
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.15);
        }
        .topic-badge {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .acc-val {
          font-size: 0.85rem;
          font-family: monospace;
          color: var(--text-muted);
        }
        .points-pill {
          display: inline-block;
          font-size: 0.76rem;
          font-weight: 800;
          color: #c7d2fe;
          background: rgba(99, 102, 241, 0.18);
          border: 1px solid rgba(99, 102, 241, 0.3);
          padding: 3px 8px;
          border-radius: 6px;
        }
        .companies-wrap {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .company-pill {
          font-size: 0.72rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 3px 8px;
          border-radius: 6px;
          color: var(--text-secondary);
        }
        .company-more {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          align-self: center;
        }
        .action-td {
          text-align: right;
        }
        .action-td .btn svg {
          transition: transform 0.15s;
        }
        .action-td .btn:hover svg {
          transform: translateX(3px);
        }

        /* Tracks Grid */
        .tracks-container, .experiences-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .section-intro h2 {
          font-size: 1.8rem;
          font-weight: 900;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }
        .section-intro p {
          color: var(--text-secondary);
          font-size: 0.94rem;
          margin: 0;
        }
        .tracks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 20px;
        }
        .track-card {
          padding: 26px;
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          gap: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.45);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .track-card:hover {
          transform: translateY(-4px);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 20px 45px -6px rgba(0, 0, 0, 0.6);
        }
        .track-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .track-badge-tag {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.08);
          color: #c7d2fe;
          padding: 3px 10px;
          border-radius: 6px;
          letter-spacing: 0.04em;
        }
        .track-pct {
          font-size: 0.88rem;
          font-weight: 800;
          color: #34d399;
        }
        .track-card-title {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0;
        }
        .track-card-sub {
          font-size: 0.86rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
          flex: 1;
        }
        .track-progress-wrap {
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 8px;
        }
        .track-progress-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s;
          background-image: linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent);
          background-size: 1rem 1rem;
          animation: progress-stripes 2s linear infinite;
        }
        .track-progress-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        .track-card-actions {
          margin-top: 10px;
        }

        /* Interview Experiences List */
        .exp-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .exp-card {
          border-radius: var(--radius-xl);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 12px 32px -6px rgba(0, 0, 0, 0.45);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .exp-card.expanded {
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 20px 48px -8px rgba(99, 102, 241, 0.25);
        }
        .exp-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 26px;
          cursor: pointer;
          gap: 18px;
          flex-wrap: wrap;
          transition: background 0.15s;
        }
        .exp-card-header:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .exp-meta-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .company-logo-badge {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25));
          color: #c7d2fe;
          font-weight: 800;
          font-size: 0.9rem;
          padding: 10px 16px;
          border-radius: 10px;
          border: 1px solid rgba(99, 102, 241, 0.35);
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.2);
        }
        .exp-title {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0 0 5px 0;
        }
        .exp-sub {
          display: flex;
          gap: 12px;
          font-size: 0.82rem;
          color: var(--text-muted);
          flex-wrap: wrap;
        }
        .exp-meta-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .verdict-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.78rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 8px;
        }
        .verdict-selected {
          background: rgba(16, 185, 129, 0.18);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.35);
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);
        }
        .expand-chevron {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .exp-card-body {
          padding: 0 26px 26px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .rounds-heading {
          font-size: 0.88rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 18px 0 0 0;
          letter-spacing: 0.05em;
        }
        .rounds-timeline {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .round-step {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .round-marker {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #fff;
          font-size: 0.82rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
        }
        .round-content {
          flex: 1;
        }
        .round-name {
          font-size: 0.95rem;
          font-weight: 800;
          margin: 0 0 4px 0;
          color: var(--text-primary);
        }
        .round-detail {
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.6;
        }
        .exp-tips-box {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          box-shadow: 0 0 16px rgba(245, 158, 11, 0.15);
          padding: 14px 18px;
          border-radius: 10px;
          font-size: 0.88rem;
          color: #fbbf24;
          line-height: 1.6;
        }
        .exp-problems-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .exp-prob-label {
          font-size: 0.84rem;
          color: var(--text-muted);
          font-weight: 700;
        }
        .exp-prob-tags {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .exp-prob-link {
          text-decoration: none;
          font-size: 0.84rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 8px;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-card {
          width: 100%;
          max-width: 760px;
          max-height: 85vh;
          overflow-y: auto;
          background: #0d121f;
          border: 1px solid rgba(129, 140, 248, 0.4);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.25);
          border-radius: var(--radius-xl);
          padding: 28px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .modal-footer {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
        }
        .cheat-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          margin-top: 12px;
        }
        .cheat-table th, .cheat-table td {
          padding: 10px 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .cheat-table th {
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-secondary);
          font-weight: 700;
        }
        .patterns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }
        .pattern-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          line-height: 1.5;
        }
        .pattern-box strong {
          color: #a5b4fc;
        }
        .empty-state {
          padding: 50px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          color: var(--text-muted);
        }

        /* Contests & Virtual Arena Styles */
        .contests-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .virtual-arena-wrapper {
          padding: 28px;
          border-radius: var(--radius-xl);
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(20, 29, 47, 0.9) 100%);
          border: 1px solid rgba(99, 102, 241, 0.25);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        }
        .virtual-arena-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .arena-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #34d399;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: ambient-pulse 2s infinite;
        }
        .arena-contest-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0 0 4px 0;
        }
        .arena-contest-type {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .arena-timer-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .timer-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }
        .digital-timer {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 1.6rem;
          font-weight: 800;
          color: #38bdf8;
          padding: 6px 18px;
          border-radius: 12px;
          background: rgba(10, 15, 29, 0.8);
          border: 1px solid rgba(56, 189, 248, 0.3);
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.15);
        }
        .digital-timer.timer-warning {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.5);
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
          animation: ambient-pulse 1.2s infinite;
        }
        .arena-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .finish-contest-btn {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
          border: none !important;
          color: #000 !important;
          font-weight: 800 !important;
        }
        .contest-hud-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          padding: 18px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .hud-metric {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .hud-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }
        .hud-val {
          font-size: 1.2rem;
          font-weight: 800;
        }
        .arena-split-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 24px;
          margin-top: 24px;
        }
        @media (max-width: 900px) {
          .arena-split-grid { grid-template-columns: 1fr; }
        }
        .column-title {
          font-size: 1rem;
          font-weight: 800;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .contest-problems-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .contest-problem-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.2s;
        }
        .contest-problem-card:hover {
          border-color: rgba(99, 102, 241, 0.35);
          background: rgba(255, 255, 255, 0.04);
        }
        .contest-problem-card.solved {
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.05);
        }
        .contest-prob-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .prob-number-badge {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
        }
        .contest-prob-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0 0 4px 0;
        }
        .contest-prob-meta {
          display: flex;
          gap: 8px;
          align-items: center;
          font-size: 0.78rem;
        }
        .time-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--text-muted);
        }
        .pts-pill {
          color: #f59e0b;
          font-weight: 700;
        }
        .contest-accepted-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #34d399;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 6px 14px;
          border-radius: 8px;
          background: rgba(16, 185, 129, 0.12);
        }
        .contest-prob-actions {
          display: flex;
          gap: 8px;
        }
        .live-leaderboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .live-pulse-tag {
          font-size: 0.75rem;
          color: #34d399;
          font-weight: 700;
        }
        .simulated-ranks-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .live-rank-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.85rem;
        }
        .live-rank-row.user-rank-highlight {
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 0 14px rgba(99, 102, 241, 0.15);
        }
        .live-rank-num {
          font-weight: 800;
          width: 32px;
          color: var(--text-muted);
        }
        .live-user-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .live-user-name {
          font-weight: 700;
          color: var(--text-primary);
        }
        .live-user-inst {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .live-user-score {
          text-align: right;
          display: flex;
          flex-direction: column;
        }
        .live-score-pts {
          font-weight: 800;
          color: #f59e0b;
        }
        .live-solved-cnt {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        /* Scorecard Modal */
        .contest-scorecard-modal {
          max-width: 520px;
          width: 90%;
          padding: 36px 32px;
          border-radius: var(--radius-xl);
          background: #0d121f;
          border: 1px solid rgba(245, 158, 11, 0.3);
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.8);
          text-align: center;
        }
        .scorecard-top-icon {
          margin-bottom: 14px;
          filter: drop-shadow(0 0 15px rgba(245, 158, 11, 0.5));
        }
        .scorecard-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0 0 6px 0;
        }
        .scorecard-sub {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 24px;
        }
        .scorecard-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 24px;
        }
        .scorecard-box {
          padding: 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .box-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .box-val {
          font-size: 1.3rem;
          font-weight: 800;
        }

        /* Contests Hub Grid */
        .contest-filter-chips {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .contest-filter-btn {
          padding: 8px 18px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .contest-filter-btn:hover {
          border-color: rgba(99, 102, 241, 0.4);
          color: var(--text-primary);
        }
        .contest-filter-btn.active {
          background: #6366f1;
          color: #fff;
          border-color: #6366f1;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
        }
        .contests-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
          gap: 24px;
        }
        .contest-card {
          padding: 28px;
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          gap: 18px;
          transition: transform 0.2s, border-color 0.2s;
        }
        .contest-card:hover {
          transform: translateY(-2px);
          border-color: rgba(99, 102, 241, 0.35);
        }
        .contest-status-pill {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.04em;
        }
        .contest-status-pill.status-live {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .contest-status-pill.status-upcoming {
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.3);
        }
        .contest-status-pill.status-past {
          background: rgba(148, 163, 184, 0.15);
          color: #94a3b8;
          border: 1px solid rgba(148, 163, 184, 0.3);
        }
        .contest-type-badge {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
        }
        .contest-title {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 6px 0 4px 0;
        }
        .contest-tagline {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
        }
        .contest-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 14px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.82rem;
        }
        .contest-meta-grid .meta-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .contest-companies-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .contest-problems-preview {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .prob-chips-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .prob-preview-chip {
          font-size: 0.78rem;
          padding: 4px 10px;
          border-radius: 8px;
          background: rgba(99, 102, 241, 0.1);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        .contest-prizes-box {
          padding: 12px 16px;
          border-radius: 10px;
          background: rgba(245, 158, 11, 0.05);
          border: 1px solid rgba(245, 158, 11, 0.15);
          font-size: 0.82rem;
        }
        .prizes-heading {
          font-weight: 700;
          color: #f59e0b;
          display: block;
          margin-bottom: 6px;
        }
        .prizes-list {
          margin: 0;
          padding-left: 18px;
          color: var(--text-secondary);
        }
        .contest-card-footer {
          margin-top: auto;
          padding-top: 10px;
        }
        .contest-action-btn {
          width: 100%;
          justify-content: center;
        }

        /* Company Kits Styles */
        .company-kits-container {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .company-selector-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 16px;
        }
        .company-select-card {
          padding: 20px;
          border-radius: 14px;
          text-align: left;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.2s;
        }
        .company-select-card:hover {
          transform: translateY(-2px);
          border-color: var(--company-accent);
        }
        .company-select-card.active {
          border-color: var(--company-accent);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.02);
        }
        .company-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .company-logo-avatar {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 800;
        }
        .company-badge-tag {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 700;
        }
        .company-select-name {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
        }
        .company-comp-pill {
          font-size: 0.78rem;
          color: var(--text-secondary);
          font-weight: 600;
        }
        .active-company-dashboard {
          padding: 32px;
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .dashboard-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          padding-left: 18px;
          border-left: 4px solid #f59e0b;
        }
        .dash-company-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 800;
          color: #fff;
          padding: 3px 10px;
          border-radius: 6px;
          margin-bottom: 6px;
        }
        .dash-company-name {
          font-size: 1.6rem;
          font-weight: 800;
          margin: 0 0 4px 0;
        }
        .dash-tagline {
          font-size: 0.95rem;
          color: var(--text-muted);
          margin: 0;
          font-style: italic;
        }
        .dash-comp-box {
          padding: 14px 20px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .comp-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
        }
        .comp-val {
          font-size: 1.25rem;
          font-weight: 800;
        }
        .dash-section-title {
          font-size: 1.05rem;
          font-weight: 800;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rounds-timeline-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }
        .round-pipeline-card {
          padding: 18px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          position: relative;
        }
        .round-num-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          color: #000;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .pipeline-round-name {
          font-size: 0.92rem;
          font-weight: 700;
          margin: 0 0 6px 0;
        }
        .pipeline-round-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
        }
        .topic-bars-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .topic-bar-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .topic-bar-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 700;
        }
        .topic-bar-track {
          width: 100%;
          height: 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
          overflow: hidden;
        }
        .topic-bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .frequent-problems-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }
        .frequent-prob-card {
          padding: 18px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .freq-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .freq-category {
          font-size: 0.75rem;
          color: #a5b4fc;
          font-weight: 700;
        }
        .freq-prob-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0;
        }
        .freq-meta-row {
          display: flex;
          gap: 14px;
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .freq-solve-btn {
          margin-top: auto;
          justify-content: center;
        }
        .behavioral-box {
          padding: 20px 24px;
          border-radius: 12px;
          background: rgba(167, 139, 250, 0.08);
          border: 1px solid rgba(167, 139, 250, 0.25);
        }

        /* Leaderboard Styles */
        .leaderboard-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .leaderboard-hero-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 18px;
        }
        .hero-metric-card {
          padding: 22px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .metric-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .metric-data {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .metric-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
        }
        .metric-head {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .metric-extra {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .user-standing-card {
          padding: 22px 28px;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%);
          border: 1px solid rgba(99, 102, 241, 0.35);
        }
        .user-standing-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .standing-avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #6366f1;
          color: #fff;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }
        .standing-name {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
        }
        .standing-pill {
          font-size: 0.75rem;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .standing-handle {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .user-standing-right {
          display: flex;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
        }
        .standing-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .leaderboard-filters-row {
          padding: 14px 20px;
          border-radius: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .leaderboard-filters-row .search-wrap {
          position: relative;
          flex: 1;
          min-width: 260px;
        }
        .leaderboard-search-input {
          width: 100%;
          padding: 9px 14px 9px 38px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 0.88rem;
        }
        .institute-select-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .inst-icon {
          color: var(--text-muted);
        }
        .institute-dropdown {
          padding: 8px 14px;
          border-radius: 8px;
          background: #0d121f;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 0.85rem;
          cursor: pointer;
        }
        .leaderboard-table-card {
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        .lb-table-head, .lb-table-row {
          display: grid;
          grid-template-columns: 80px 1.5fr 1.2fr 1.1fr 100px 90px 90px;
          align-items: center;
          gap: 14px;
          padding: 14px 22px;
        }
        .lb-table-head {
          background: rgba(255, 255, 255, 0.04);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.78rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.04em;
        }
        .lb-table-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          font-size: 0.88rem;
          transition: background 0.15s;
        }
        .lb-table-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .lb-table-row.top-rank-row {
          background: rgba(255, 255, 255, 0.015);
        }
        .medal-badge {
          font-weight: 800;
          font-size: 0.95rem;
        }
        .rank-num {
          font-weight: 700;
          color: var(--text-muted);
        }
        .col-coder {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .coder-avatar {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.85rem;
          flex-shrink: 0;
        }
        .coder-names {
          display: flex;
          flex-direction: column;
        }
        .coder-display-name {
          font-weight: 700;
          color: var(--text-primary);
        }
        .coder-handle {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .institute-pill {
          font-size: 0.82rem;
          color: var(--text-secondary);
        }
        .col-rating {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rating-val {
          font-weight: 800;
          font-family: var(--font-mono);
        }
        .tier-badge {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .solved-pill {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .streak-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.82rem;
          color: #f97316;
          font-weight: 700;
        }
        .podium-count {
          font-size: 0.82rem;
          color: #f59e0b;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

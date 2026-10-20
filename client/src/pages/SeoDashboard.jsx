import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Globe,
  Share2,
  Sparkles,
  Link2,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Trash2,
  Eye,
  Edit3,
  Copy,
  Sliders,
  Send,
  Zap,
  Check,
  X,
  Layers,
  ArrowRight,
  FileText,
  Settings,
  Terminal,
  Activity,
  Code
} from 'lucide-react';

export default function SeoDashboard() {
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'generator' | 'autopilot' | 'integrations'
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters for Articles tab
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Generator State
  const [selectedSubject, setSelectedSubject] = useState('python');
  const [generationEngine, setGenerationEngine] = useState('smart_template'); // 'smart_template' | 'gemini'
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState('');
  const [websiteUrlInput, setWebsiteUrlInput] = useState('http://localhost:3000');
  const [generating, setGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState(null);
  const [generatorMessage, setGeneratorMessage] = useState(null);

  // AutoPilot State
  const [autoPilotTriggering, setAutoPilotTriggering] = useState(false);
  const [autoPilotMessage, setAutoPilotMessage] = useState(null);

  // Inspection / Publish Modal State
  const [activeModalPost, setActiveModalPost] = useState(null);
  const [modalViewMode, setModalViewMode] = useState('preview'); // 'preview' | 'markdown'
  const [publishingInProgress, setPublishingInProgress] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    medium: true,
    devto: true,
    hashnode: true,
    wordpress: false,
    googleSites: false
  });
  const [manualPayloads, setManualPayloads] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  // Load manual publishing payloads when modal post opens
  useEffect(() => {
    if (activeModalPost?._id) {
      api.getSeoManualPayloads(activeModalPost._id)
        .then(res => { if (res.payloads) setManualPayloads(res.payloads); })
        .catch(() => {});
    } else {
      setManualPayloads(null);
    }
  }, [activeModalPost]);

  // Settings Edit State
  const [settingsFormData, setSettingsFormData] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaveFeedback, setSettingsSaveFeedback] = useState(null);
  const [testingPlatform, setTestingPlatform] = useState(null);
  const [platformTestFeedback, setPlatformTestFeedback] = useState({});

  // Google Apps Script Modal
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [gasScriptCode, setGasScriptCode] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);

  // Available subjects metadata
  const [subjectsList, setSubjectsList] = useState([]);

  // Fetch initial dashboard data
  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [statsRes, postsRes, settingsRes, subjectsRes] = await Promise.all([
        api.getSeoStats().catch(() => ({ stats: null })),
        api.getSeoPosts(`?status=${statusFilter}&subject=${subjectFilter}&search=${encodeURIComponent(searchQuery)}&page=1&limit=25`).catch(() => ({ posts: [], pagination: {} })),
        api.getSeoSettings().catch(() => ({ settings: null })),
        api.getSeoSubjectsAndLessons().catch(() => ({ subjects: [] }))
      ]);

      if (statsRes.stats) setStats(statsRes.stats);
      if (postsRes.posts) {
        setPosts(postsRes.posts);
        setPagination(postsRes.pagination || { page: 1, pages: 1, total: postsRes.posts.length });
      }
      if (settingsRes.settings) {
        setSettings(settingsRes.settings);
        setSettingsFormData(JSON.parse(JSON.stringify(settingsRes.settings)));
        if (settingsRes.settings.websiteBaseUrl) {
          setWebsiteUrlInput(settingsRes.settings.websiteBaseUrl);
        }
      }
      if (subjectsRes.subjects) {
        setSubjectsList(subjectsRes.subjects);
      }
    } catch (err) {
      console.error('Failed to load SEO dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, subjectFilter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load Google Apps Script template
  useEffect(() => {
    api.getGoogleAppsScriptCode()
      .then(res => { if (res.code) setGasScriptCode(res.code); })
      .catch(() => {});
  }, []);

  // Handle Generate Article
  const handleGenerateArticle = async (saveImmediately = true) => {
    setGenerating(true);
    setGeneratorMessage(null);
    try {
      const res = await api.generateSeoPost({
        subject: selectedSubject,
        forceProvider: generationEngine,
        geminiApiKey: geminiApiKeyInput || undefined,
        websiteBaseUrl: websiteUrlInput,
        saveImmediately
      });

      setGeneratedPreview(res.generated);
      setGeneratorMessage({
        type: 'success',
        text: res.message || 'Article generated and verified successfully!'
      });

      if (saveImmediately && res.post) {
        fetchData();
      }
    } catch (err) {
      setGeneratorMessage({
        type: 'error',
        text: err.message || 'Article generation failed.'
      });
    } finally {
      setGenerating(false);
    }
  };

  // Handle Manual Auto-Pilot Trigger
  const handleTriggerAutoPilot = async () => {
    setAutoPilotTriggering(true);
    setAutoPilotMessage(null);
    try {
      const res = await api.triggerSeoAutoPilot();
      setAutoPilotMessage({
        type: res.success ? 'success' : 'error',
        text: res.message
      });
      fetchData();
    } catch (err) {
      setAutoPilotMessage({
        type: 'error',
        text: err.message || 'Auto-Pilot execution failed.'
      });
    } finally {
      setAutoPilotTriggering(false);
    }
  };

  // Handle Single Post Publish
  const handlePublishPost = async (postId, platforms = null, dryRun = false) => {
    setPublishingInProgress(true);
    setPublishFeedback(null);
    try {
      const platformsToSend = platforms || Object.keys(selectedPlatforms).filter(p => selectedPlatforms[p]);
      if (platformsToSend.length === 0) {
        setPublishFeedback({ type: 'error', text: 'Please select at least one publishing platform.' });
        setPublishingInProgress(false);
        return;
      }

      const res = await api.publishSeoPost(postId, {
        platforms: platformsToSend,
        dryRun
      });

      setPublishFeedback({
        type: res.success ? 'success' : 'warning',
        text: res.message,
        results: res.results
      });

      // Update active modal post view
      if (res.post) {
        setActiveModalPost(res.post);
      }
      fetchData();
    } catch (err) {
      setPublishFeedback({
        type: 'error',
        text: err.message || 'Publishing failed.'
      });
    } finally {
      setPublishingInProgress(false);
    }
  };

  // Handle Post Deletion
  const handleDeletePost = async (postId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.deleteSeoPost(postId);
      fetchData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Handle Uniqueness Re-check
  const handleCheckUniqueness = async (postId) => {
    try {
      const res = await api.checkSeoPostUniqueness(postId);
      alert(`Uniqueness Verified: ${res.uniquenessScore}% Unique\nHighest similarity with existing posts: ${res.result?.highestSimilarityPercent || 0}%`);
      fetchData();
    } catch (err) {
      alert(`Check failed: ${err.message}`);
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSaveFeedback(null);
    try {
      const res = await api.updateSeoSettings(settingsFormData);
      setSettingsSaveFeedback({ type: 'success', text: res.message });
      fetchData();
    } catch (err) {
      setSettingsSaveFeedback({ type: 'error', text: err.message || 'Failed to save settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle Connection Test for a Platform
  const handleTestConnection = async (platform) => {
    setTestingPlatform(platform);
    setPlatformTestFeedback(prev => ({ ...prev, [platform]: null }));
    try {
      const credentials = {};
      if (platform === 'wordpress') {
        credentials.siteUrl = settingsFormData.wordpress?.siteUrl;
        credentials.username = settingsFormData.wordpress?.username;
        credentials.applicationPassword = settingsFormData.wordpress?.applicationPassword;
      } else if (platform === 'devto') {
        credentials.apiKey = settingsFormData.devto?.apiKey;
      } else if (platform === 'hashnode') {
        credentials.accessToken = settingsFormData.hashnode?.accessToken;
        credentials.publicationId = settingsFormData.hashnode?.publicationId;
      } else if (platform === 'medium') {
        credentials.integrationToken = settingsFormData.medium?.integrationToken;
      } else if (platform === 'googleSites') {
        credentials.webhookUrl = settingsFormData.googleSites?.webhookUrl;
        credentials.secretToken = settingsFormData.googleSites?.secretToken;
      } else if (platform === 'gemini') {
        credentials.geminiApiKey = settingsFormData.aiEngine?.geminiApiKey;
        credentials.modelName = settingsFormData.aiEngine?.modelName;
      }

      const res = await api.testSeoPlatformConnection(platform, credentials);
      setPlatformTestFeedback(prev => ({
        ...prev,
        [platform]: { type: 'success', message: res.result?.message || 'Connection test succeeded!' }
      }));
      fetchData();
    } catch (err) {
      setPlatformTestFeedback(prev => ({
        ...prev,
        [platform]: { type: 'error', message: err.message || 'Connection test failed.' }
      }));
    } finally {
      setTestingPlatform(null);
    }
  };

  if (loading && !stats) {
    return (
      <div className="seo-loading-screen">
        <RefreshCw className="spin-icon" size={32} />
        <p>Initializing Automated SEO Backlink Engine...</p>
      </div>
    );
  }

  return (
    <div className="seo-dashboard-container">
      {/* Top Banner */}
      <div className="seo-header">
        <div className="seo-header-content">
          <div className="seo-badge-row">
            <span className="seo-pill-tag pulse-tag">
              <Zap size={14} className="tag-icon" /> Automated SEO Backlinks
            </span>
            <span className="seo-pill-tag live-badge">
              <ShieldCheck size={14} className="tag-icon" /> Anti-Duplicate Protection
            </span>
          </div>
          <h1 className="seo-title">SEO Backlink Engine & Multi-Platform Publisher</h1>
          <p className="seo-subtitle">
            Generate high-ranking technical articles for DataDrix with organic contextual backlinks, then auto-publish to Google Sites, WordPress & Medium via official APIs.
          </p>
        </div>

        <div className="seo-header-actions">
          <button
            className="seo-btn seo-btn-primary"
            onClick={() => setActiveTab('generator')}
          >
            <Sparkles size={16} /> Generate New Article
          </button>
          <button
            className="seo-btn seo-btn-accent"
            onClick={handleTriggerAutoPilot}
            disabled={autoPilotTriggering}
          >
            <RefreshCw size={16} className={autoPilotTriggering ? 'spin-icon' : ''} />
            {autoPilotTriggering ? 'Running Auto-Pilot...' : 'Run Auto-Pilot Now'}
          </button>
        </div>
      </div>

      {autoPilotMessage && (
        <div className={`seo-alert-box ${autoPilotMessage.type}`}>
          {autoPilotMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{autoPilotMessage.text}</span>
          <button className="alert-close" onClick={() => setAutoPilotMessage(null)}>×</button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="seo-metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Articles</span>
            <FileText className="metric-icon blue-icon" size={20} />
          </div>
          <div className="metric-value">{stats?.totalPosts || 0}</div>
          <div className="metric-subtext">
            <span className="status-dot green-dot"></span> {stats?.publishedCount || 0} Published &bull; {stats?.draftCount || 0} Drafts
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Live Backlinks Injected</span>
            <Link2 className="metric-icon emerald-icon" size={20} />
          </div>
          <div className="metric-value">{stats?.totalBacklinks || 0}</div>
          <div className="metric-subtext">
            Contextual dofollow links pointing to DataDrix
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Average Uniqueness</span>
            <ShieldCheck className="metric-icon cyan-icon" size={20} />
          </div>
          <div className="metric-value">{stats?.avgUniqueness || 100}%</div>
          <div className="metric-subtext">
            SHA-256 & N-Gram anti-duplicate verified
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Platform Distribution</span>
            <Share2 className="metric-icon purple-icon" size={20} />
          </div>
          <div className="platform-pills-row">
            <span className="platform-pill med-pill" title="Medium Posts">
              Medium: <b>{stats?.platforms?.medium || 0}</b>
            </span>
            <span className="platform-pill dev-pill" title="Dev.to Posts">
              Dev.to: <b>{stats?.platforms?.devto || 0}</b>
            </span>
            <span className="platform-pill hash-pill" title="Hashnode Posts">
              Hashnode: <b>{stats?.platforms?.hashnode || 0}</b>
            </span>
            <span className="platform-pill wp-pill" title="WordPress Posts">
              WP: <b>{stats?.platforms?.wordpress || 0}</b>
            </span>
            <span className="platform-pill gs-pill" title="Google Sites Posts">
              Sites: <b>{stats?.platforms?.googleSites || 0}</b>
            </span>
          </div>
          <div className="metric-subtext">
            Auto-Pilot: <b style={{ color: stats?.autoPilot?.enabled ? '#10b981' : '#94a3b8' }}>
              {stats?.autoPilot?.enabled ? 'Active (Scheduled)' : 'Standby'}
            </b>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="seo-tabs-bar">
        <button
          className={`seo-tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
          onClick={() => setActiveTab('articles')}
        >
          <Layers size={18} /> Articles & Drafts ({posts.length})
        </button>
        <button
          className={`seo-tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => setActiveTab('generator')}
        >
          <Sparkles size={18} /> Article Generator
        </button>
        <button
          className={`seo-tab-btn ${activeTab === 'autopilot' ? 'active' : ''}`}
          onClick={() => setActiveTab('autopilot')}
        >
          <Clock size={18} /> Auto-Pilot Scheduler
        </button>
        <button
          className={`seo-tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          <Settings size={18} /> Platform Integrations & APIs
        </button>
      </div>

      {/* TAB 1: ARTICLES & DRAFTS */}
      {activeTab === 'articles' && (
        <div className="tab-pane-content">
          {/* Filters Bar */}
          <div className="articles-filter-bar">
            <div className="filter-group">
              <span className="filter-label">Filter:</span>
              <button
                className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-pill ${statusFilter === 'draft' ? 'active' : ''}`}
                onClick={() => setStatusFilter('draft')}
              >
                Drafts
              </button>
              <button
                className={`filter-pill ${statusFilter === 'published' ? 'active' : ''}`}
                onClick={() => setStatusFilter('published')}
              >
                Published
              </button>
              <button
                className={`filter-pill ${statusFilter === 'medium' ? 'active' : ''}`}
                onClick={() => setStatusFilter('medium')}
              >
                Medium
              </button>
              <button
                className={`filter-pill ${statusFilter === 'devto' ? 'active' : ''}`}
                onClick={() => setStatusFilter('devto')}
              >
                Dev.to
              </button>
              <button
                className={`filter-pill ${statusFilter === 'hashnode' ? 'active' : ''}`}
                onClick={() => setStatusFilter('hashnode')}
              >
                Hashnode
              </button>
              <button
                className={`filter-pill ${statusFilter === 'wordpress' ? 'active' : ''}`}
                onClick={() => setStatusFilter('wordpress')}
              >
                WordPress
              </button>
              <button
                className={`filter-pill ${statusFilter === 'googleSites' ? 'active' : ''}`}
                onClick={() => setStatusFilter('googleSites')}
              >
                Google Sites
              </button>
            </div>

            <div className="filter-inputs">
              <select
                className="seo-select"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {subjectsList.map(s => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>

              <input
                type="text"
                className="seo-search-input"
                placeholder="Search articles, keywords, backlinks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <button className="seo-btn-icon" onClick={fetchData} title="Refresh list">
                <RefreshCw size={16} className={refreshing ? 'spin-icon' : ''} />
              </button>
            </div>
          </div>

          {/* Posts List / Table */}
          {posts.length === 0 ? (
            <div className="seo-empty-state">
              <FileText size={48} className="empty-icon" />
              <h3>No SEO blog posts match the selected filter</h3>
              <p>Generate a unique article or adjust your search parameters to view drafts.</p>
              <button
                className="seo-btn seo-btn-primary"
                onClick={() => setActiveTab('generator')}
              >
                <Sparkles size={16} /> Generate Your First Article
              </button>
            </div>
          ) : (
            <div className="seo-posts-grid">
              {posts.map(post => {
                const medPub = post.platformPublications?.medium;
                const devPub = post.platformPublications?.devto;
                const hashPub = post.platformPublications?.hashnode;
                const wpPub = post.platformPublications?.wordpress;
                const gsPub = post.platformPublications?.googleSites;

                return (
                  <div key={post._id} className="seo-post-card">
                    <div className="post-card-header">
                      <div className="post-badges-row">
                        <span className="subject-tag">{post.targetSubject.toUpperCase()}</span>
                        <span className={`uniqueness-badge ${post.uniquenessScore >= 80 ? 'high' : 'medium'}`}>
                          <ShieldCheck size={12} /> {post.uniquenessScore}% Unique
                        </span>
                        <span className={`status-pill ${post.status}`}>
                          {post.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="word-count-tag">
                        {post.wordCount} words &bull; {post.readingTimeMinutes} min read
                      </span>
                    </div>

                    <h3 className="post-card-title">{post.title}</h3>
                    <p className="post-card-excerpt">{post.metaDescription}</p>

                    {/* Backlinks highlight */}
                    <div className="post-backlinks-section">
                      <span className="backlinks-header">
                        <Link2 size={13} /> {post.backlinks?.length || 0} Injected Backlinks:
                      </span>
                      <div className="backlinks-chips-row">
                        {(post.backlinks || []).map((bl, idx) => (
                          <span key={idx} className="backlink-chip" title={bl.targetUrl}>
                            "{bl.anchorText}" &rarr; <code>{bl.targetUrl.replace(/https?:\/\/[^\/]+/, '') || '/'}</code>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Platform publication status */}
                    <div className="post-platforms-status">
                      <div className="platform-pub-indicator">
                        <span className="platform-name">Medium:</span>
                        {medPub?.status === 'published' ? (
                          <a href={medPub.url} target="_blank" rel="noopener noreferrer" className="pub-link live">
                            Live <ExternalLink size={12} />
                          </a>
                        ) : medPub?.status === 'draft' ? (
                          <span className="pub-link draft">Draft</span>
                        ) : (
                          <span className="pub-link pending">Not Published</span>
                        )}
                      </div>

                      <div className="platform-pub-indicator">
                        <span className="platform-name">Dev.to:</span>
                        {devPub?.status === 'published' ? (
                          <a href={devPub.url} target="_blank" rel="noopener noreferrer" className="pub-link live">
                            Live <ExternalLink size={12} />
                          </a>
                        ) : devPub?.status === 'draft' ? (
                          <a href={devPub.url || 'https://dev.to/dashboard'} target="_blank" rel="noopener noreferrer" className="pub-link draft">
                            Draft <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="pub-link pending">Not Published</span>
                        )}
                      </div>

                      <div className="platform-pub-indicator">
                        <span className="platform-name">Hashnode:</span>
                        {hashPub?.status === 'published' ? (
                          <a href={hashPub.url} target="_blank" rel="noopener noreferrer" className="pub-link live">
                            Live <ExternalLink size={12} />
                          </a>
                        ) : hashPub?.status === 'draft' ? (
                          <span className="pub-link draft">Draft</span>
                        ) : (
                          <span className="pub-link pending">Not Published</span>
                        )}
                      </div>

                      <div className="platform-pub-indicator">
                        <span className="platform-name">WordPress:</span>
                        {wpPub?.status === 'published' ? (
                          <a href={wpPub.url} target="_blank" rel="noopener noreferrer" className="pub-link live">
                            Live <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="pub-link pending">Not Published</span>
                        )}
                      </div>

                      <div className="platform-pub-indicator">
                        <span className="platform-name">Google Sites:</span>
                        {gsPub?.status === 'published' ? (
                          <a href={gsPub.url} target="_blank" rel="noopener noreferrer" className="pub-link live">
                            Live <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="pub-link pending">Not Published</span>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="post-card-actions">
                      <button
                        className="card-action-btn primary"
                        onClick={() => {
                          setActiveModalPost(post);
                          setPublishFeedback(null);
                        }}
                      >
                        <Eye size={15} /> Preview & Publish
                      </button>

                      <button
                        className="card-action-btn"
                        onClick={() => handleCheckUniqueness(post._id)}
                        title="Verify against duplicate content across entire site"
                      >
                        <ShieldCheck size={15} /> Check Duplicates
                      </button>

                      <button
                        className="card-action-btn danger"
                        onClick={() => handleDeletePost(post._id, post.title)}
                        title="Delete article draft"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ARTICLE GENERATOR */}
      {activeTab === 'generator' && (
        <div className="tab-pane-content">
          <div className="generator-two-column-layout">
            {/* Left Column: Form Controls */}
            <div className="generator-controls-card">
              <h2 className="card-title">
                <Sparkles size={20} className="title-icon" /> Automated Article Generator
              </h2>
              <p className="card-description">
                Creates unique, SEO-optimized, publication-ready technical guides with contextual backlinks into DataDrix's curriculum and interactive tools.
              </p>

              {generatorMessage && (
                <div className={`seo-alert-box ${generatorMessage.type}`}>
                  {generatorMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span>{generatorMessage.text}</span>
                  <button className="alert-close" onClick={() => setGeneratorMessage(null)}>×</button>
                </div>
              )}

              <div className="generator-form-group">
                <label className="form-label">1. Target Learning Subject</label>
                <div className="subject-button-grid">
                  {subjectsList.map(s => (
                    <button
                      key={s.slug}
                      type="button"
                      className={`subject-select-btn ${selectedSubject === s.slug ? 'active' : ''}`}
                      onClick={() => setSelectedSubject(s.slug)}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="generator-form-group">
                <label className="form-label">2. Generation Engine</label>
                <div className="engine-toggle-row">
                  <button
                    type="button"
                    className={`engine-pill-btn ${generationEngine === 'smart_template' ? 'active' : ''}`}
                    onClick={() => setGenerationEngine('smart_template')}
                  >
                    <Zap size={15} /> Free Smart Algorithmic Multi-Variant Engine (Zero Cost & 100% Offline)
                  </button>
                  <button
                    type="button"
                    className={`engine-pill-btn ${generationEngine === 'gemini' ? 'active' : ''}`}
                    onClick={() => setGenerationEngine('gemini')}
                  >
                    <Sparkles size={15} /> Google Gemini AI (Free API Key from Google AI Studio)
                  </button>
                </div>

                {generationEngine === 'gemini' && (
                  <div className="gemini-key-input-box">
                    <label className="sub-label">Gemini API Key (Optional if already configured in settings):</label>
                    <input
                      type="password"
                      className="seo-input"
                      placeholder="AIzaSy..."
                      value={geminiApiKeyInput}
                      onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                    />
                    <small className="input-helper">
                      Get your 100% free Gemini API key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer">Google AI Studio</a>.
                    </small>
                  </div>
                )}
              </div>

              <div className="generator-form-group">
                <label className="form-label">3. Target Website Base URL (For Backlinks)</label>
                <input
                  type="text"
                  className="seo-input"
                  value={websiteUrlInput}
                  onChange={(e) => setWebsiteUrlInput(e.target.value)}
                  placeholder="https://datadrix.com or http://localhost:3000"
                />
                <small className="input-helper">
                  Backlinks will point to this domain for subjects, lesson guides, and code playgrounds.
                </small>
              </div>

              <div className="generator-actions-row">
                <button
                  type="button"
                  className="seo-btn seo-btn-primary full-width"
                  disabled={generating}
                  onClick={() => handleGenerateArticle(true)}
                >
                  <Sparkles size={18} className={generating ? 'spin-icon' : ''} />
                  {generating ? 'Synthesizing Unique Article & Backlinks...' : 'Generate & Save Draft Post'}
                </button>
              </div>
            </div>

            {/* Right Column: Live Preview Card */}
            <div className="generator-preview-card">
              <div className="preview-card-header">
                <h3 className="preview-heading">
                  <Eye size={18} /> Generated Article Live Preview
                </h3>
                {generatedPreview && (
                  <span className="uniqueness-tag">
                    <ShieldCheck size={14} /> {generatedPreview.uniquenessScore || 100}% Unique &bull; {generatedPreview.wordCount} words
                  </span>
                )}
              </div>

              {generating ? (
                <div className="preview-loading-box">
                  <RefreshCw size={36} className="spin-icon" />
                  <h4>Crafting SEO-Optimized Article...</h4>
                  <ul className="generation-steps-list">
                    <li><Check size={14} className="step-check" /> Analyzing curriculum structures & lessons</li>
                    <li><Check size={14} className="step-check" /> Selecting high-relevance anchor texts</li>
                    <li><Check size={14} className="step-check" /> Compiling syntax-highlighted code blocks</li>
                    <li><Check size={14} className="step-check" /> Running SHA-256 duplicate fingerprint verification</li>
                  </ul>
                </div>
              ) : generatedPreview ? (
                <div className="preview-body-scrollable">
                  <div className="preview-meta-box">
                    <div className="preview-meta-title">{generatedPreview.title}</div>
                    <div className="preview-meta-desc">{generatedPreview.metaDescription}</div>
                    <div className="preview-keywords-row">
                      {(generatedPreview.targetKeywords || []).map((kw, i) => (
                        <span key={i} className="kw-tag">#{kw}</span>
                      ))}
                    </div>
                  </div>

                  <div className="preview-injected-backlinks-bar">
                    <b>Injected Backlinks:</b>
                    <ul>
                      {(generatedPreview.backlinks || []).map((bl, i) => (
                        <li key={i}>
                          Anchor: <code>"{bl.anchorText}"</code> &rarr; Target: <a href={bl.targetUrl} target="_blank" rel="noreferrer">{bl.targetUrl}</a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className="preview-rendered-html markdown-rendered"
                    dangerouslySetInnerHTML={{ __html: generatedPreview.contentHtml }}
                  />
                </div>
              ) : (
                <div className="preview-empty-placeholder">
                  <Code size={48} className="empty-icon" />
                  <h4>No article generated yet</h4>
                  <p>Choose a target subject on the left and click "Generate & Save Draft Post" to preview and inspect your SEO article in real time.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTOPILOT SCHEDULER */}
      {activeTab === 'autopilot' && (
        <div className="tab-pane-content">
          <div className="autopilot-management-grid">
            <div className="autopilot-settings-card">
              <div className="card-header-with-status">
                <div>
                  <h2 className="card-title">
                    <Clock size={20} className="title-icon" /> Auto-Pilot Scheduler
                  </h2>
                  <p className="card-description">
                    Continuously generates and publishes unique articles on a recurring schedule in the background.
                  </p>
                </div>
                <div className={`status-badge-live ${settingsFormData?.autoPilot?.enabled ? 'active' : 'paused'}`}>
                  {settingsFormData?.autoPilot?.enabled ? 'AUTOPILOT ACTIVE' : 'STANDBY'}
                </div>
              </div>

              <form onSubmit={handleSaveSettings}>
                <div className="form-toggle-switch-row">
                  <div>
                    <div className="switch-title">Enable Background Scheduler</div>
                    <div className="switch-desc">When enabled, the server will trigger automated generation cycles via cron.</div>
                  </div>
                  <input
                    type="checkbox"
                    className="seo-toggle"
                    checked={settingsFormData?.autoPilot?.enabled || false}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      autoPilot: { ...prev.autoPilot, enabled: e.target.checked }
                    }))}
                  />
                </div>

                <div className="generator-form-group">
                  <label className="form-label">Generation Frequency</label>
                  <select
                    className="seo-select"
                    value={settingsFormData?.autoPilot?.intervalHours || 24}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      autoPilot: { ...prev.autoPilot, intervalHours: parseInt(e.target.value) }
                    }))}
                  >
                    <option value={6}>Every 6 Hours (4 articles / day)</option>
                    <option value={12}>Every 12 Hours (2 articles / day)</option>
                    <option value={24}>Every 24 Hours (1 article / day - Recommended)</option>
                    <option value={48}>Every 48 Hours (1 article every 2 days)</option>
                    <option value={168}>Every 7 Days (1 article / week)</option>
                  </select>
                </div>

                <div className="form-toggle-switch-row">
                  <div>
                    <div className="switch-title">Auto-Publish to External Platforms</div>
                    <div className="switch-desc">If disabled, articles are saved as Drafts for review before publishing.</div>
                  </div>
                  <input
                    type="checkbox"
                    className="seo-toggle"
                    checked={settingsFormData?.autoPilot?.autoPublish || false}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      autoPilot: { ...prev.autoPilot, autoPublish: e.target.checked }
                    }))}
                  />
                </div>

                <div className="generator-form-group">
                  <label className="form-label">Target External Platforms for Auto-Publishing</label>
                  <div className="platforms-checkboxes-row">
                    <label className="platform-check-item">
                      <input
                        type="checkbox"
                        checked={settingsFormData?.autoPilot?.platforms?.wordpress || false}
                        onChange={(e) => setSettingsFormData(prev => ({
                          ...prev,
                          autoPilot: {
                            ...prev.autoPilot,
                            platforms: { ...prev.autoPilot.platforms, wordpress: e.target.checked }
                          }
                        }))}
                      />
                      <span>WordPress</span>
                    </label>

                    <label className="platform-check-item">
                      <input
                        type="checkbox"
                        checked={settingsFormData?.autoPilot?.platforms?.medium || false}
                        onChange={(e) => setSettingsFormData(prev => ({
                          ...prev,
                          autoPilot: {
                            ...prev.autoPilot,
                            platforms: { ...prev.autoPilot.platforms, medium: e.target.checked }
                          }
                        }))}
                      />
                      <span>Medium</span>
                    </label>

                    <label className="platform-check-item">
                      <input
                        type="checkbox"
                        checked={settingsFormData?.autoPilot?.platforms?.googleSites || false}
                        onChange={(e) => setSettingsFormData(prev => ({
                          ...prev,
                          autoPilot: {
                            ...prev.autoPilot,
                            platforms: { ...prev.autoPilot.platforms, googleSites: e.target.checked }
                          }
                        }))}
                      />
                      <span>Google Sites</span>
                    </label>
                  </div>
                </div>

                <div className="scheduler-actions">
                  <button type="submit" className="seo-btn seo-btn-primary" disabled={savingSettings}>
                    {savingSettings ? 'Saving...' : 'Save Auto-Pilot Schedule'}
                  </button>
                  <button
                    type="button"
                    className="seo-btn seo-btn-accent"
                    onClick={handleTriggerAutoPilot}
                    disabled={autoPilotTriggering}
                  >
                    <RefreshCw size={15} className={autoPilotTriggering ? 'spin-icon' : ''} />
                    Trigger 1 Cycle Right Now
                  </button>
                </div>
              </form>
            </div>

            {/* Audit Logs Column */}
            <div className="autopilot-logs-card">
              <h3 className="card-title">
                <Activity size={18} className="title-icon" /> Auto-Pilot Execution Logs
              </h3>
              <p className="card-description">
                Real-time activity log of background runs, generated blogs, and publishing results.
              </p>

              <div className="logs-scrollable-container">
                {(!settings?.activityLogs || settings.activityLogs.length === 0) ? (
                  <div className="logs-empty">
                    <Terminal size={32} className="empty-icon" />
                    <p>No activity logs recorded yet. Click "Trigger 1 Cycle Right Now" to test execution.</p>
                  </div>
                ) : (
                  <div className="logs-timeline">
                    {settings.activityLogs.slice(0, 30).map((log, i) => (
                      <div key={i} className={`log-entry ${log.success ? 'success' : 'error'}`}>
                        <div className="log-time">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                        <div className="log-action">
                          <span className={`log-action-badge ${log.action}`}>
                            {log.action.toUpperCase()}
                          </span>
                          {log.subject && <span className="log-subject-badge">{log.subject}</span>}
                        </div>
                        <div className="log-message">{log.message}</div>
                        {log.blogTitle && <div className="log-title">Article: "{log.blogTitle}"</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PLATFORM INTEGRATIONS & APIS */}
      {activeTab === 'integrations' && (
        <div className="tab-pane-content">
          <form onSubmit={handleSaveSettings} className="integrations-form-grid">
            {/* Global Settings Save Banner */}
            <div className="integrations-header-bar">
              <div>
                <h2>External Platform APIs & Credentials</h2>
                <p>Configure official free APIs for Medium, Dev.to, Hashnode, WordPress, and Google Sites. All credentials are stored securely in environment or encrypted settings.</p>
              </div>
              <button type="submit" className="seo-btn seo-btn-primary" disabled={savingSettings}>
                {savingSettings ? 'Saving Settings...' : 'Save All Platform Credentials'}
              </button>
            </div>

            {settingsSaveFeedback && (
              <div className={`seo-alert-box ${settingsSaveFeedback.type}`}>
                {settingsSaveFeedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span>{settingsSaveFeedback.text}</span>
                <button className="alert-close" onClick={() => setSettingsSaveFeedback(null)}>×</button>
              </div>
            )}

            {/* 1. WordPress Card */}
            <div className="integration-card">
              <div className="integration-header">
                <div className="integration-title-box">
                  <div className="platform-logo wp-logo">WP</div>
                  <div>
                    <h3>WordPress REST API</h3>
                    <small>Official WordPress REST API with Application Passwords (Free Core Feature)</small>
                  </div>
                </div>
                <div className="platform-status-badge">
                  {settings?.wordpress?.connectionStatus === 'connected' ? (
                    <span className="badge-connected"><CheckCircle size={13} /> Connected</span>
                  ) : (
                    <span className="badge-untested"><AlertCircle size={13} /> Untested</span>
                  )}
                </div>
              </div>

              <div className="integration-body">
                <div className="generator-form-group">
                  <label className="form-label">WordPress Site URL</label>
                  <input
                    type="text"
                    className="seo-input"
                    placeholder="https://example.com or https://myblog.wordpress.com"
                    value={settingsFormData?.wordpress?.siteUrl || ''}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      wordpress: { ...prev.wordpress, siteUrl: e.target.value }
                    }))}
                  />
                </div>

                <div className="generator-form-group">
                  <label className="form-label">WordPress Username</label>
                  <input
                    type="text"
                    className="seo-input"
                    placeholder="admin"
                    value={settingsFormData?.wordpress?.username || ''}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      wordpress: { ...prev.wordpress, username: e.target.value }
                    }))}
                  />
                </div>

                <div className="generator-form-group">
                  <label className="form-label">Application Password</label>
                  <input
                    type="password"
                    className="seo-input"
                    placeholder={settings?.wordpress?.hasPassword ? '•••••••••••••••• (Configured)' : 'xxxx xxxx xxxx xxxx'}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      wordpress: { ...prev.wordpress, applicationPassword: e.target.value }
                    }))}
                  />
                  <small className="input-helper">
                    Generate in WP Admin &rarr; Users &rarr; Profile &rarr; Application Passwords.
                  </small>
                </div>

                <div className="generator-form-group">
                  <label className="form-label">Default Publish Status</label>
                  <select
                    className="seo-select"
                    value={settingsFormData?.wordpress?.defaultStatus || 'draft'}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      wordpress: { ...prev.wordpress, defaultStatus: e.target.value }
                    }))}
                  >
                    <option value="draft">Save as Draft (Safe)</option>
                    <option value="publish">Publish Live Directly</option>
                  </select>
                </div>

                {platformTestFeedback.wordpress && (
                  <div className={`platform-test-alert ${platformTestFeedback.wordpress.type}`}>
                    {platformTestFeedback.wordpress.message}
                  </div>
                )}

                <button
                  type="button"
                  className="seo-btn seo-btn-outline"
                  onClick={() => handleTestConnection('wordpress')}
                  disabled={testingPlatform === 'wordpress'}
                >
                  <RefreshCw size={14} className={testingPlatform === 'wordpress' ? 'spin-icon' : ''} />
                  Test WordPress Connection
                </button>
              </div>
            </div>

            {/* 2. Medium Card */}
            <div className="integration-card">
              <div className="integration-header">
                <div className="integration-title-box">
                  <div className="platform-logo med-logo">M</div>
                  <div>
                    <h3>Medium REST API</h3>
                    <small>Official Medium Integration Tokens with Canonical URLs (Free)</small>
                  </div>
                </div>
                <div className="platform-status-badge">
                  {settings?.medium?.connectionStatus === 'connected' ? (
                    <span className="badge-connected"><CheckCircle size={13} /> Connected</span>
                  ) : (
                    <span className="badge-untested"><AlertCircle size={13} /> Untested</span>
                  )}
                </div>
              </div>

              <div className="integration-body">
                <div className="generator-form-group">
                  <label className="form-label">Medium Integration Token</label>
                  <input
                    type="password"
                    className="seo-input"
                    placeholder={settings?.medium?.hasToken ? settings.medium.integrationTokenMasked : 'Paste Medium Integration Token...'}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      medium: { ...prev.medium, integrationToken: e.target.value }
                    }))}
                  />
                  <small className="input-helper">
                    Generate free token in <a href="https://medium.com/me/settings/security" target="_blank" rel="noreferrer">Medium Settings &rarr; Security &rarr; Integration Tokens</a>.
                  </small>
                </div>

                <div className="generator-form-group">
                  <label className="form-label">Medium Author ID</label>
                  <input
                    type="text"
                    className="seo-input"
                    placeholder="Auto-detected upon testing"
                    value={settingsFormData?.medium?.authorId || ''}
                    readOnly
                  />
                </div>

                <div className="generator-form-group">
                  <label className="form-label">Default Publish Status</label>
                  <select
                    className="seo-select"
                    value={settingsFormData?.medium?.defaultStatus || 'draft'}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      medium: { ...prev.medium, defaultStatus: e.target.value }
                    }))}
                  >
                    <option value="draft">Draft (Review on Medium before publicizing)</option>
                    <option value="public">Public (Published immediately to readers)</option>
                    <option value="unlisted">Unlisted (Accessible only via link)</option>
                  </select>
                </div>

                {platformTestFeedback.medium && (
                  <div className={`platform-test-alert ${platformTestFeedback.medium.type}`}>
                    {platformTestFeedback.medium.message}
                  </div>
                )}

                <button
                  type="button"
                  className="seo-btn seo-btn-outline"
                  onClick={() => handleTestConnection('medium')}
                  disabled={testingPlatform === 'medium'}
                >
                  <RefreshCw size={14} className={testingPlatform === 'medium' ? 'spin-icon' : ''} />
                  Test Medium Connection
                </button>
              </div>
            </div>

            {/* 3. Dev.to Card */}
            <div className="integration-card">
              <div className="integration-header">
                <div className="integration-title-box">
                  <div className="platform-logo devto-logo">DEV</div>
                  <div>
                    <h3>Dev.to (Forem) API</h3>
                    <small>Official DEV Community REST API with Canonical Links (Free)</small>
                  </div>
                </div>
                <div className="platform-status-badge">
                  {settings?.devto?.connectionStatus === 'connected' ? (
                    <span className="badge-connected"><CheckCircle size={13} /> Connected</span>
                  ) : settings?.devto?.connectionStatus === 'error' ? (
                    <span className="badge-untested"><AlertCircle size={13} /> Error</span>
                  ) : (
                    <span className="badge-untested"><AlertCircle size={13} /> Untested</span>
                  )}
                </div>
              </div>

              <div className="integration-body">
                <div className="generator-form-group">
                  <label className="form-label">DEV Community API Key</label>
                  <input
                    type="password"
                    className="seo-input"
                    placeholder={settings?.devto?.hasApiKey ? settings.devto.apiKeyMasked : 'Paste DEV API Key...'}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      devto: { ...prev.devto, apiKey: e.target.value }
                    }))}
                  />
                  <small className="input-helper">
                    Generate free API key in <a href="https://dev.to/settings/extensions" target="_blank" rel="noreferrer">Dev.to &rarr; Settings &rarr; Extensions &rarr; DEV Community API Keys</a>.
                  </small>
                </div>

                <div className="generator-form-group">
                  <label className="form-label">Default Publish Status</label>
                  <select
                    className="seo-select"
                    value={settingsFormData?.devto?.defaultStatus || 'draft'}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      devto: { ...prev.devto, defaultStatus: e.target.value }
                    }))}
                  >
                    <option value="draft">Draft (Review on Dev.to dashboard before publicizing)</option>
                    <option value="published">Published (Publish immediately live)</option>
                  </select>
                </div>

                {platformTestFeedback.devto && (
                  <div className={`platform-test-alert ${platformTestFeedback.devto.type}`}>
                    {platformTestFeedback.devto.message}
                  </div>
                )}

                <button
                  type="button"
                  className="seo-btn seo-btn-outline"
                  onClick={() => handleTestConnection('devto')}
                  disabled={testingPlatform === 'devto'}
                >
                  <RefreshCw size={14} className={testingPlatform === 'devto' ? 'spin-icon' : ''} />
                  Test Dev.to Connection
                </button>
              </div>
            </div>

            {/* 4. Hashnode Card */}
            <div className="integration-card">
              <div className="integration-header">
                <div className="integration-title-box">
                  <div className="platform-logo hashnode-logo">HN</div>
                  <div>
                    <h3>Hashnode GraphQL API</h3>
                    <small>Official Hashnode Engineering Blogs API (Free)</small>
                  </div>
                </div>
                <div className="platform-status-badge">
                  {settings?.hashnode?.connectionStatus === 'connected' ? (
                    <span className="badge-connected"><CheckCircle size={13} /> Connected</span>
                  ) : settings?.hashnode?.connectionStatus === 'error' ? (
                    <span className="badge-untested"><AlertCircle size={13} /> Error</span>
                  ) : (
                    <span className="badge-untested"><AlertCircle size={13} /> Untested</span>
                  )}
                </div>
              </div>

              <div className="integration-body">
                <div className="generator-form-group">
                  <label className="form-label">Personal Access Token</label>
                  <input
                    type="password"
                    className="seo-input"
                    placeholder={settings?.hashnode?.hasToken ? settings.hashnode.accessTokenMasked : 'Paste Hashnode Personal Access Token...'}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      hashnode: { ...prev.hashnode, accessToken: e.target.value }
                    }))}
                  />
                  <small className="input-helper">
                    Generate in <a href="https://hashnode.com/settings/developer" target="_blank" rel="noreferrer">Hashnode &rarr; Account Settings &rarr; Developer &rarr; Access Tokens</a>.
                  </small>
                </div>

                <div className="generator-form-group">
                  <label className="form-label">Hashnode Publication ID</label>
                  <input
                    type="text"
                    className="seo-input"
                    placeholder="e.g. 64abc123def456... (from blog dashboard URL or settings)"
                    value={settingsFormData?.hashnode?.publicationId || ''}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      hashnode: { ...prev.hashnode, publicationId: e.target.value }
                    }))}
                  />
                  <small className="input-helper">
                    Found in your Hashnode publication dashboard URL or publication settings.
                  </small>
                </div>

                <div className="generator-form-group">
                  <label className="form-label">Default Publish Status</label>
                  <select
                    className="seo-select"
                    value={settingsFormData?.hashnode?.defaultStatus || 'draft'}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      hashnode: { ...prev.hashnode, defaultStatus: e.target.value }
                    }))}
                  >
                    <option value="draft">Draft (Save to publication drafts)</option>
                    <option value="published">Published (Publish immediately live)</option>
                  </select>
                </div>

                {platformTestFeedback.hashnode && (
                  <div className={`platform-test-alert ${platformTestFeedback.hashnode.type}`}>
                    {platformTestFeedback.hashnode.message}
                  </div>
                )}

                <button
                  type="button"
                  className="seo-btn seo-btn-outline"
                  onClick={() => handleTestConnection('hashnode')}
                  disabled={testingPlatform === 'hashnode'}
                >
                  <RefreshCw size={14} className={testingPlatform === 'hashnode' ? 'spin-icon' : ''} />
                  Test Hashnode Connection
                </button>
              </div>
            </div>

            {/* 5. Google Sites Card */}
            <div className="integration-card">
              <div className="integration-header">
                <div className="integration-title-box">
                  <div className="platform-logo gs-logo">G</div>
                  <div>
                    <h3>Google Sites Integration</h3>
                    <small>Automated Google Apps Script Webhook or Clean Embed Sync</small>
                  </div>
                </div>
                <div className="platform-status-badge">
                  {settings?.googleSites?.connectionStatus === 'connected' ? (
                    <span className="badge-connected"><CheckCircle size={13} /> Connected</span>
                  ) : (
                    <span className="badge-untested"><AlertCircle size={13} /> Untested</span>
                  )}
                </div>
              </div>

              <div className="integration-body">
                <div className="generator-form-group">
                  <label className="form-label">Google Apps Script Webhook URL</label>
                  <input
                    type="text"
                    className="seo-input"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={settingsFormData?.googleSites?.webhookUrl || ''}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      googleSites: { ...prev.googleSites, webhookUrl: e.target.value }
                    }))}
                  />
                  <small className="input-helper">
                    Deploy our 100% free Google Apps Script web app in Google Drive to receive blogs automatically.
                  </small>
                </div>

                <div className="generator-form-group">
                  <label className="form-label">Google Sites Public URL</label>
                  <input
                    type="text"
                    className="seo-input"
                    placeholder="https://sites.google.com/view/datadrix-academy/blog"
                    value={settingsFormData?.googleSites?.siteUrl || ''}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      googleSites: { ...prev.googleSites, siteUrl: e.target.value }
                    }))}
                  />
                </div>

                <div className="generator-form-group">
                  <label className="form-label">Secret Security Token</label>
                  <input
                    type="text"
                    className="seo-input"
                    value={settingsFormData?.googleSites?.secretToken || 'datadrix-sites-secret-key-2026'}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      googleSites: { ...prev.googleSites, secretToken: e.target.value }
                    }))}
                  />
                </div>

                {platformTestFeedback.googleSites && (
                  <div className={`platform-test-alert ${platformTestFeedback.googleSites.type}`}>
                    {platformTestFeedback.googleSites.message}
                  </div>
                )}

                <div className="gs-action-buttons">
                  <button
                    type="button"
                    className="seo-btn seo-btn-outline"
                    onClick={() => handleTestConnection('googleSites')}
                    disabled={testingPlatform === 'googleSites'}
                  >
                    <RefreshCw size={14} className={testingPlatform === 'googleSites' ? 'spin-icon' : ''} />
                    Test Webhook
                  </button>

                  <button
                    type="button"
                    className="seo-btn seo-btn-secondary"
                    onClick={() => setShowScriptModal(true)}
                  >
                    <Code size={14} /> View & Copy Google Apps Script
                  </button>
                </div>
              </div>
            </div>

            {/* 4. AI Engine & Canonical Settings Card */}
            <div className="integration-card">
              <div className="integration-header">
                <div className="integration-title-box">
                  <div className="platform-logo ai-logo">AI</div>
                  <div>
                    <h3>AI & Canonical SEO Configuration</h3>
                    <small>Gemini AI API Key (Free) & Canonical URL Domain</small>
                  </div>
                </div>
                <div className="platform-status-badge">
                  {settings?.aiEngine?.connectionStatus === 'connected' ? (
                    <span className="badge-connected"><CheckCircle size={13} /> Active</span>
                  ) : (
                    <span className="badge-untested"><Zap size={13} /> Built-in Engine Active</span>
                  )}
                </div>
              </div>

              <div className="integration-body">
                <div className="generator-form-group">
                  <label className="form-label">Primary AI Provider</label>
                  <select
                    className="seo-select"
                    value={settingsFormData?.aiEngine?.provider || 'smart_template'}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      aiEngine: { ...prev.aiEngine, provider: e.target.value }
                    }))}
                  >
                    <option value="smart_template">Free Algorithmic Multi-Variant Engine (Zero Cost & 100% Offline)</option>
                    <option value="gemini">Google Gemini AI Engine (Google AI Studio Free Tier)</option>
                  </select>
                </div>

                <div className="generator-form-group">
                  <label className="form-label">Google Gemini API Key</label>
                  <input
                    type="password"
                    className="seo-input"
                    placeholder={settings?.aiEngine?.hasApiKey ? settings.aiEngine.geminiApiKeyMasked : 'AIzaSy...'}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      aiEngine: { ...prev.aiEngine, geminiApiKey: e.target.value }
                    }))}
                  />
                  <small className="input-helper">
                    Free API keys available at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer">Google AI Studio</a>.
                  </small>
                </div>

                <div className="generator-form-group">
                  <label className="form-label">Target Website Base URL for Backlinks</label>
                  <input
                    type="text"
                    className="seo-input"
                    value={settingsFormData?.websiteBaseUrl || 'http://localhost:3000'}
                    onChange={(e) => setSettingsFormData(prev => ({
                      ...prev,
                      websiteBaseUrl: e.target.value
                    }))}
                  />
                </div>

                {platformTestFeedback.gemini && (
                  <div className={`platform-test-alert ${platformTestFeedback.gemini.type}`}>
                    {platformTestFeedback.gemini.message}
                  </div>
                )}

                <button
                  type="button"
                  className="seo-btn seo-btn-outline"
                  onClick={() => handleTestConnection('gemini')}
                  disabled={testingPlatform === 'gemini'}
                >
                  <RefreshCw size={14} className={testingPlatform === 'gemini' ? 'spin-icon' : ''} />
                  Test Gemini API Connection
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ARTICLE PREVIEW & PUBLISH MODAL */}
      {activeModalPost && (
        <div className="seo-modal-overlay">
          <div className="seo-modal-dialog large-modal">
            <div className="seo-modal-header">
              <div>
                <span className="subject-tag">{activeModalPost.targetSubject.toUpperCase()}</span>
                <h2 className="modal-title">{activeModalPost.title}</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModalPost(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="seo-modal-body">
              {publishFeedback && (
                <div className={`seo-alert-box ${publishFeedback.type}`}>
                  {publishFeedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span>{publishFeedback.text}</span>
                  <button className="alert-close" onClick={() => setPublishFeedback(null)}>×</button>
                </div>
              )}

              {/* Publication Status & Action Bar */}
              <div className="modal-publish-toolbar">
                <div className="platform-checkboxes-modal">
                  <span className="toolbar-label">Publish Targets:</span>
                  <label className="platform-label-check">
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.medium}
                      onChange={(e) => setSelectedPlatforms(p => ({ ...p, medium: e.target.checked }))}
                    />
                    <span>Medium</span>
                  </label>

                  <label className="platform-label-check">
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.devto}
                      onChange={(e) => setSelectedPlatforms(p => ({ ...p, devto: e.target.checked }))}
                    />
                    <span>Dev.to</span>
                  </label>

                  <label className="platform-label-check">
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.hashnode}
                      onChange={(e) => setSelectedPlatforms(p => ({ ...p, hashnode: e.target.checked }))}
                    />
                    <span>Hashnode</span>
                  </label>

                  <label className="platform-label-check">
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.wordpress}
                      onChange={(e) => setSelectedPlatforms(p => ({ ...p, wordpress: e.target.checked }))}
                    />
                    <span>WordPress</span>
                  </label>

                  <label className="platform-label-check">
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.googleSites}
                      onChange={(e) => setSelectedPlatforms(p => ({ ...p, googleSites: e.target.checked }))}
                    />
                    <span>Google Sites</span>
                  </label>
                </div>

                <div className="toolbar-buttons">
                  <button
                    className="seo-btn seo-btn-secondary"
                    onClick={() => handlePublishPost(activeModalPost._id, null, true)}
                    disabled={publishingInProgress}
                    title="Simulate publication without pushing to live endpoints"
                  >
                    Simulate / Dry Run
                  </button>
                  <button
                    className="seo-btn seo-btn-primary"
                    onClick={() => handlePublishPost(activeModalPost._id)}
                    disabled={publishingInProgress}
                  >
                    <Send size={15} />
                    {publishingInProgress ? 'Publishing to APIs...' : 'Publish to Selected Platforms'}
                  </button>
                </div>
              </div>

              {/* View toggle (Rendered HTML vs Markdown vs Manual Copy Helper) */}
              <div className="modal-view-mode-tabs">
                <button
                  className={`mode-tab ${modalViewMode === 'preview' ? 'active' : ''}`}
                  onClick={() => setModalViewMode('preview')}
                >
                  <Eye size={14} /> Rendered HTML Preview
                </button>
                <button
                  className={`mode-tab ${modalViewMode === 'markdown' ? 'active' : ''}`}
                  onClick={() => setModalViewMode('markdown')}
                >
                  <Code size={14} /> Raw Markdown
                </button>
                <button
                  className={`mode-tab ${modalViewMode === 'manual' ? 'active' : ''}`}
                  onClick={() => setModalViewMode('manual')}
                >
                  <Copy size={14} /> 1-Click Manual Publish Helper
                </button>
              </div>

              <div className="modal-content-container">
                {modalViewMode === 'preview' ? (
                  <div
                    className="modal-rendered-markdown markdown-rendered"
                    dangerouslySetInnerHTML={{ __html: activeModalPost.contentHtml }}
                  />
                ) : modalViewMode === 'markdown' ? (
                  <pre className="modal-raw-markdown">{activeModalPost.contentMarkdown}</pre>
                ) : (
                  <div className="manual-publishing-helper">
                    <div className="helper-lead-banner">
                      <Zap size={18} className="lead-icon" />
                      <div>
                        <strong>1-Click Manual Publishing Hub</strong>
                        <p>No API key? You can publish in seconds manually! Each payload below includes technical accuracy, relevant backlink anchors, and canonical URL settings to guarantee full SEO credit for LearnForge.</p>
                      </div>
                    </div>

                    <div className="manual-cards-grid">
                      {/* DEV.TO CARD */}
                      <div className="manual-platform-card">
                        <div className="manual-card-header">
                          <div className="platform-badge-group">
                            <span className="platform-logo devto-logo">DEV</span>
                            <div>
                              <h4>Dev.to (Forem)</h4>
                              <small>Frontmatter + Markdown</small>
                            </div>
                          </div>
                          <a
                            href={manualPayloads?.devto?.targetUrl || 'https://dev.to/new'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="editor-launch-btn"
                          >
                            Open Dev.to Editor <ExternalLink size={12} />
                          </a>
                        </div>

                        <div className="manual-card-body">
                          <p className="manual-instructions">
                            Dev.to automatically parses YAML frontmatter for title, canonical link, and tags:
                          </p>
                          <div className="manual-btn-group">
                            <button
                              className="copy-snippet-btn primary"
                              onClick={() => copyToClipboard(manualPayloads?.devto?.markdown || activeModalPost.contentMarkdown, 'devto_all')}
                            >
                              {copiedKey === 'devto_all' ? <Check size={13} /> : <Copy size={13} />}
                              {copiedKey === 'devto_all' ? 'Copied Full Article!' : 'Copy Full Article (With Frontmatter)'}
                            </button>
                            <button
                              className="copy-snippet-btn"
                              onClick={() => copyToClipboard(manualPayloads?.devto?.canonicalUrl || activeModalPost.canonicalUrl, 'devto_canon')}
                            >
                              {copiedKey === 'devto_canon' ? <Check size={13} /> : <Copy size={13} />}
                              {copiedKey === 'devto_canon' ? 'Copied!' : 'Copy Canonical URL'}
                            </button>
                          </div>

                          <div className="payload-preview-box">
                            <span className="box-label">Frontmatter Preview</span>
                            <pre>{manualPayloads?.devto?.frontmatter || `---
title: "${activeModalPost.title}"
published: false
canonical_url: "${activeModalPost.canonicalUrl || 'https://learnforge-learning-platform.onrender.com/'}"
tags: ${(activeModalPost.tags || ['programming']).slice(0, 4).join(', ')}
---`}</pre>
                          </div>
                        </div>
                      </div>

                      {/* HASHNODE CARD */}
                      <div className="manual-platform-card">
                        <div className="manual-card-header">
                          <div className="platform-badge-group">
                            <span className="platform-logo hashnode-logo">HN</span>
                            <div>
                              <h4>Hashnode</h4>
                              <small>Markdown + Advanced Canonical</small>
                            </div>
                          </div>
                          <a
                            href={manualPayloads?.hashnode?.targetUrl || 'https://hashnode.com/draft'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="editor-launch-btn"
                          >
                            Open Hashnode Drafts <ExternalLink size={12} />
                          </a>
                        </div>

                        <div className="manual-card-body">
                          <p className="manual-instructions">
                            Paste markdown body into Hashnode. In "Advanced Settings", verify Canonical URL:
                          </p>
                          <div className="manual-btn-group">
                            <button
                              className="copy-snippet-btn primary"
                              onClick={() => copyToClipboard(manualPayloads?.hashnode?.markdown || activeModalPost.contentMarkdown, 'hash_body')}
                            >
                              {copiedKey === 'hash_body' ? <Check size={13} /> : <Copy size={13} />}
                              {copiedKey === 'hash_body' ? 'Copied Markdown!' : 'Copy Markdown Content'}
                            </button>
                            <button
                              className="copy-snippet-btn"
                              onClick={() => copyToClipboard(manualPayloads?.hashnode?.title || activeModalPost.title, 'hash_title')}
                            >
                              {copiedKey === 'hash_title' ? <Check size={13} /> : <Copy size={13} />}
                              {copiedKey === 'hash_title' ? 'Copied!' : 'Copy Title'}
                            </button>
                            <button
                              className="copy-snippet-btn"
                              onClick={() => copyToClipboard(manualPayloads?.hashnode?.canonicalUrl || activeModalPost.canonicalUrl, 'hash_canon')}
                            >
                              {copiedKey === 'hash_canon' ? <Check size={13} /> : <Copy size={13} />}
                              {copiedKey === 'hash_canon' ? 'Copied!' : 'Copy Canonical URL'}
                            </button>
                          </div>

                          <div className="payload-preview-box">
                            <span className="box-label">Canonical URL to paste in Hashnode Advanced:</span>
                            <code>{manualPayloads?.hashnode?.canonicalUrl || activeModalPost.canonicalUrl || 'N/A'}</code>
                          </div>
                        </div>
                      </div>

                      {/* MEDIUM CARD */}
                      <div className="manual-platform-card">
                        <div className="manual-card-header">
                          <div className="platform-badge-group">
                            <span className="platform-logo med-logo">M</span>
                            <div>
                              <h4>Medium</h4>
                              <small>Rich Text / HTML + Canonical</small>
                            </div>
                          </div>
                          <a
                            href={manualPayloads?.medium?.targetUrl || 'https://medium.com/new-story'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="editor-launch-btn"
                          >
                            Open Medium Story <ExternalLink size={12} />
                          </a>
                        </div>

                        <div className="manual-card-body">
                          <p className="manual-instructions">
                            Paste into Medium. In <code>... &rarr; More settings &rarr; Advanced settings</code>, check "This story was originally published elsewhere":
                          </p>
                          <div className="manual-btn-group">
                            <button
                              className="copy-snippet-btn primary"
                              onClick={() => copyToClipboard(activeModalPost.contentMarkdown, 'med_md')}
                            >
                              {copiedKey === 'med_md' ? <Check size={13} /> : <Copy size={13} />}
                              {copiedKey === 'med_md' ? 'Copied Markdown!' : 'Copy Markdown Content'}
                            </button>
                            <button
                              className="copy-snippet-btn"
                              onClick={() => copyToClipboard(manualPayloads?.medium?.title || activeModalPost.title, 'med_title')}
                            >
                              {copiedKey === 'med_title' ? <Check size={13} /> : <Copy size={13} />}
                              {copiedKey === 'med_title' ? 'Copied!' : 'Copy Title'}
                            </button>
                            <button
                              className="copy-snippet-btn"
                              onClick={() => copyToClipboard(manualPayloads?.medium?.canonicalUrl || activeModalPost.canonicalUrl, 'med_canon')}
                            >
                              {copiedKey === 'med_canon' ? <Check size={13} /> : <Copy size={13} />}
                              {copiedKey === 'med_canon' ? 'Copied!' : 'Copy Canonical URL'}
                            </button>
                          </div>

                          <div className="payload-preview-box">
                            <span className="box-label">Tags to enter (up to 5):</span>
                            <code>{(manualPayloads?.medium?.tags || activeModalPost.tags || []).join(', ')}</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="seo-modal-footer">
              <div className="footer-meta">
                <span>Canonical: <code>{activeModalPost.canonicalUrl || 'N/A'}</code></span>
                <span>Uniqueness: <b>{activeModalPost.uniquenessScore}%</b></span>
              </div>
              <button className="seo-btn seo-btn-outline" onClick={() => setActiveModalPost(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GOOGLE APPS SCRIPT MODAL */}
      {showScriptModal && (
        <div className="seo-modal-overlay">
          <div className="seo-modal-dialog">
            <div className="seo-modal-header">
              <div>
                <h2 className="modal-title">Google Sites Webhook Script (Free)</h2>
                <small>Deploy this lightweight Google Apps Script in Google Drive to publish directly to Google Sites.</small>
              </div>
              <button className="modal-close-btn" onClick={() => setShowScriptModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="seo-modal-body">
              <div className="gas-instructions-box">
                <h4>Quick 3-Minute Setup:</h4>
                <ol>
                  <li>Go to <a href="https://script.google.com" target="_blank" rel="noreferrer">script.google.com</a> and click <b>New project</b>.</li>
                  <li>Paste the script code below into <code>Code.gs</code>.</li>
                  <li>Click <b>Deploy &rarr; New deployment</b>, select <b>Web app</b>, execute as <b>Me</b>, access: <b>Anyone</b>.</li>
                  <li>Copy your generated Web App URL and paste it into the <b>Google Sites Webhook URL</b> in Settings!</li>
                </ol>
              </div>

              <div className="code-copy-wrapper">
                <button
                  className="copy-code-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(gasScriptCode);
                    setCopiedScript(true);
                    setTimeout(() => setCopiedScript(false), 2000);
                  }}
                >
                  {copiedScript ? <Check size={14} /> : <Copy size={14} />}
                  {copiedScript ? 'Copied to Clipboard!' : 'Copy Script Code'}
                </button>
                <pre className="gas-code-block">{gasScriptCode}</pre>
              </div>
            </div>

            <div className="seo-modal-footer">
              <button className="seo-btn seo-btn-primary" onClick={() => setShowScriptModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded High-Aesthetic Styling */}
      <style>{`
        .seo-dashboard-container {
          max-width: 1350px;
          margin: 0 auto;
          padding: 30px 24px 80px;
          color: #f1f5f9;
        }

        .seo-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85));
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 28px 32px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(12px);
        }

        .seo-badge-row {
          display: flex;
          gap: 10px;
          margin-bottom: 12px;
        }

        .seo-pill-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .pulse-tag {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .live-badge {
          background: rgba(6, 182, 212, 0.15);
          color: #22d3ee;
          border: 1px solid rgba(6, 182, 212, 0.3);
        }

        .seo-title {
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #ffffff 30%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .seo-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
          max-width: 680px;
          margin: 0;
          line-height: 1.5;
        }

        .seo-header-actions {
          display: flex;
          gap: 12px;
        }

        .seo-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .seo-btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
        }

        .seo-btn-primary:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transform: translateY(-1px);
        }

        .seo-btn-accent {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
        }

        .seo-btn-accent:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-1px);
        }

        .seo-btn-secondary {
          background: rgba(51, 65, 85, 0.8);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .seo-btn-secondary:hover {
          background: rgba(71, 85, 105, 0.9);
        }

        .seo-btn-outline {
          background: transparent;
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.4);
        }

        .seo-btn-outline:hover {
          background: rgba(56, 189, 248, 0.1);
        }

        .full-width {
          width: 100%;
          justify-content: center;
        }

        /* Metrics */
        .seo-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .metric-card {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 20px;
          backdrop-filter: blur(8px);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .metric-label {
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .metric-value {
          font-size: 1.9rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }

        .metric-subtext {
          font-size: 0.8rem;
          color: #64748b;
        }

        .blue-icon { color: #60a5fa; }
        .emerald-icon { color: #34d399; }
        .cyan-icon { color: #22d3ee; }
        .purple-icon { color: #c084fc; }

        .platform-pills-row {
          display: flex;
          gap: 8px;
          margin: 6px 0 8px;
        }

        .platform-pill {
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
        }

        .wp-pill { background: rgba(33, 117, 155, 0.25); color: #38bdf8; }
        .med-pill { background: rgba(0, 171, 107, 0.25); color: #4ade80; }
        .gs-pill { background: rgba(66, 133, 244, 0.25); color: #818cf8; }

        /* Tabs Bar */
        .seo-tabs-bar {
          display: flex;
          gap: 6px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 24px;
          padding-bottom: 6px;
        }

        .seo-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          background: transparent;
          color: #94a3b8;
          border: none;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .seo-tab-btn:hover {
          color: #f1f5f9;
          background: rgba(255, 255, 255, 0.04);
        }

        .seo-tab-btn.active {
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.25);
        }

        /* Filter Bar */
        .articles-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 12px 18px;
          margin-bottom: 20px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-label {
          color: #64748b;
          font-size: 0.82rem;
          font-weight: 500;
        }

        .filter-pill {
          padding: 5px 12px;
          border-radius: 8px;
          background: rgba(30, 41, 59, 0.7);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .filter-pill:hover {
          color: #e2e8f0;
          background: rgba(51, 65, 85, 0.7);
        }

        .filter-pill.active {
          background: #3b82f6;
          color: #ffffff;
          border-color: #3b82f6;
        }

        .filter-inputs {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .seo-select, .seo-input, .seo-search-input {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          padding: 8px 12px;
          color: #f1f5f9;
          font-size: 0.86rem;
          outline: none;
        }

        .seo-select:focus, .seo-input:focus, .seo-search-input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
        }

        .seo-btn-icon {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 8px 10px;
          color: #94a3b8;
          cursor: pointer;
        }

        .seo-btn-icon:hover {
          color: #ffffff;
        }

        /* Post Cards */
        .seo-posts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .seo-post-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 22px;
          transition: transform 0.15s ease, border-color 0.15s ease;
        }

        .seo-post-card:hover {
          border-color: rgba(56, 189, 248, 0.3);
          transform: translateY(-2px);
        }

        .post-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .post-badges-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .subject-tag {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .uniqueness-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .uniqueness-badge.high {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-pill {
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .status-pill.draft { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
        .status-pill.published { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .status-pill.failed { background: rgba(239, 68, 68, 0.2); color: #f87171; }

        .word-count-tag {
          color: #64748b;
          font-size: 0.78rem;
        }

        .post-card-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 6px 0;
        }

        .post-card-excerpt {
          color: #94a3b8;
          font-size: 0.88rem;
          line-height: 1.45;
          margin: 0 0 14px 0;
        }

        .post-backlinks-section {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 14px;
        }

        .backlinks-header {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #38bdf8;
          margin-bottom: 6px;
        }

        .backlinks-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .backlink-chip {
          background: rgba(56, 189, 248, 0.1);
          color: #bae6fd;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          border: 1px solid rgba(56, 189, 248, 0.2);
        }

        .backlink-chip code {
          color: #34d399;
          font-size: 0.72rem;
        }

        .post-platforms-status {
          display: flex;
          gap: 20px;
          padding: 10px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 14px;
          font-size: 0.82rem;
        }

        .platform-pub-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .platform-name {
          color: #64748b;
        }

        .pub-link.live {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #34d399;
          font-weight: 600;
          text-decoration: underline;
        }

        .pub-link.pending {
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .post-card-actions {
          display: flex;
          gap: 10px;
        }

        .card-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          background: rgba(51, 65, 85, 0.7);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.15s ease;
        }

        .card-action-btn:hover {
          background: rgba(71, 85, 105, 0.9);
        }

        .card-action-btn.primary {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
        }

        .card-action-btn.primary:hover {
          background: #1d4ed8;
        }

        .card-action-btn.danger {
          color: #f87171;
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.2);
        }

        .card-action-btn.danger:hover {
          background: rgba(239, 68, 68, 0.25);
        }

        /* Two Column Generator Layout */
        .generator-two-column-layout {
          display: grid;
          grid-template-columns: 460px 1fr;
          gap: 24px;
        }

        @media (max-width: 1080px) {
          .generator-two-column-layout {
            grid-template-columns: 1fr;
          }
        }

        .generator-controls-card, .generator-preview-card {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(10px);
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 6px 0;
        }

        .title-icon { color: #38bdf8; }

        .card-description {
          color: #94a3b8;
          font-size: 0.85rem;
          line-height: 1.5;
          margin: 0 0 20px 0;
        }

        .generator-form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 600;
          color: #cbd5e1;
          margin-bottom: 8px;
        }

        .subject-button-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .subject-select-btn {
          padding: 9px 12px;
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.7);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.82rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .subject-select-btn:hover {
          color: #ffffff;
          background: rgba(51, 65, 85, 0.5);
        }

        .subject-select-btn.active {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border-color: #3b82f6;
        }

        .engine-toggle-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .engine-pill-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.7);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.8rem;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .engine-pill-btn.active {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border-color: #10b981;
        }

        .gemini-key-input-box {
          margin-top: 10px;
          padding: 12px;
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .sub-label {
          display: block;
          font-size: 0.76rem;
          color: #94a3b8;
          margin-bottom: 6px;
        }

        .input-helper {
          display: block;
          color: #64748b;
          font-size: 0.75rem;
          margin-top: 6px;
        }

        .input-helper a {
          color: #38bdf8;
          text-decoration: underline;
        }

        /* Preview Card */
        .preview-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 16px;
        }

        .preview-heading {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .uniqueness-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .preview-body-scrollable {
          max-height: 650px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .preview-meta-box {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 14px;
        }

        .preview-meta-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .preview-meta-desc {
          color: #94a3b8;
          font-size: 0.85rem;
          margin-bottom: 8px;
        }

        .preview-keywords-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .kw-tag {
          background: rgba(56, 189, 248, 0.12);
          color: #38bdf8;
          padding: 2px 7px;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 600;
        }

        .preview-injected-backlinks-bar {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
          font-size: 0.8rem;
          color: #a7f3d0;
        }

        .preview-injected-backlinks-bar ul {
          margin: 6px 0 0 16px;
          padding: 0;
        }

        .preview-injected-backlinks-bar li {
          margin-bottom: 4px;
        }

        .preview-injected-backlinks-bar a {
          color: #38bdf8;
          text-decoration: underline;
        }

        .preview-loading-box, .preview-empty-placeholder {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
        }

        .generation-steps-list {
          list-style: none;
          padding: 0;
          max-width: 340px;
          margin: 20px auto 0;
          text-align: left;
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .generation-steps-list li {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .step-check {
          color: #10b981;
        }

        /* AutoPilot Grid */
        .autopilot-management-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 900px) {
          .autopilot-management-grid {
            grid-template-columns: 1fr;
          }
        }

        .autopilot-settings-card, .autopilot-logs-card {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
        }

        .card-header-with-status {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .status-badge-live {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .status-badge-live.active {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }

        .status-badge-live.paused {
          background: rgba(100, 116, 139, 0.2);
          color: #94a3b8;
          border: 1px solid rgba(100, 116, 139, 0.4);
        }

        .form-toggle-switch-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          margin-bottom: 18px;
        }

        .switch-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: #f1f5f9;
        }

        .switch-desc {
          font-size: 0.78rem;
          color: #94a3b8;
        }

        .seo-toggle {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .platforms-checkboxes-row {
          display: flex;
          gap: 16px;
        }

        .platform-check-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #cbd5e1;
          cursor: pointer;
        }

        .scheduler-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        /* Logs */
        .logs-scrollable-container {
          max-height: 480px;
          overflow-y: auto;
        }

        .logs-timeline {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .log-entry {
          background: rgba(15, 23, 42, 0.6);
          border-left: 3px solid #3b82f6;
          border-radius: 6px;
          padding: 10px 14px;
          font-size: 0.82rem;
        }

        .log-entry.error {
          border-left-color: #ef4444;
        }

        .log-time {
          color: #64748b;
          font-size: 0.72rem;
          margin-bottom: 4px;
        }

        .log-action {
          display: flex;
          gap: 6px;
          align-items: center;
          margin-bottom: 4px;
        }

        .log-action-badge {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.68rem;
          font-weight: 700;
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        .log-subject-badge {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.68rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
        }

        .log-message {
          color: #e2e8f0;
          margin-bottom: 2px;
        }

        .log-title {
          color: #94a3b8;
          font-style: italic;
          font-size: 0.78rem;
        }

        /* Integrations Form Grid */
        .integrations-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
          gap: 20px;
        }

        .integrations-header-bar {
          grid-column: 1 / -1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 20px 24px;
          margin-bottom: 8px;
        }

        .integrations-header-bar h2 {
          margin: 0 0 4px 0;
          font-size: 1.3rem;
        }

        .integrations-header-bar p {
          margin: 0;
          color: #94a3b8;
          font-size: 0.85rem;
        }

        .integration-card {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 22px;
        }

        .integration-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .integration-title-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .platform-logo {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1rem;
        }

        .wp-logo { background: #21759b; color: white; }
        .med-logo { background: #00ab6b; color: white; }
        .devto-logo { background: #0a0a0a; color: white; border: 1px solid #444; }
        .hashnode-logo { background: #2942ff; color: white; }
        .gs-logo { background: #4285f4; color: white; }
        .ai-logo { background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; }

        .integration-title-box h3 {
          margin: 0;
          font-size: 1.05rem;
          color: #ffffff;
        }

        .integration-title-box small {
          color: #94a3b8;
          font-size: 0.76rem;
        }

        .badge-connected {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 600;
        }

        .badge-untested {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(100, 116, 139, 0.2);
          color: #94a3b8;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.72rem;
        }

        .platform-test-alert {
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          margin: 12px 0;
        }

        .platform-test-alert.success {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .platform-test-alert.error {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .gs-action-buttons {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        /* Modal */
        .seo-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .seo-modal-dialog {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }

        .seo-modal-dialog.large-modal {
          max-width: 950px;
        }

        .seo-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .modal-title {
          margin: 4px 0 0 0;
          font-size: 1.25rem;
          color: #ffffff;
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        .modal-close-btn:hover { color: white; }

        .seo-modal-body {
          padding: 20px 24px;
          overflow-y: auto;
          flex: 1;
        }

        .modal-publish-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 16px;
        }

        .platform-checkboxes-modal {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .toolbar-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #94a3b8;
        }

        .platform-label-check {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.82rem;
          color: #cbd5e1;
          cursor: pointer;
        }

        .toolbar-buttons {
          display: flex;
          gap: 8px;
        }

        .modal-view-mode-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .mode-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          background: rgba(30, 41, 59, 0.5);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.8rem;
          cursor: pointer;
        }

        .mode-tab.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .modal-content-container {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 20px;
          max-height: 480px;
          overflow-y: auto;
        }

        .modal-raw-markdown {
          white-space: pre-wrap;
          font-family: monospace;
          font-size: 0.85rem;
          color: #e2e8f0;
          margin: 0;
        }

        .seo-modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .footer-meta {
          font-size: 0.8rem;
          color: #64748b;
          display: flex;
          gap: 16px;
        }

        .footer-meta code {
          color: #38bdf8;
        }

        .gas-instructions-box {
          background: rgba(30, 41, 59, 0.7);
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 16px;
          font-size: 0.85rem;
          color: #cbd5e1;
        }

        .gas-instructions-box h4 {
          margin: 0 0 8px 0;
          color: #38bdf8;
        }

        .gas-instructions-box ol {
          margin: 0;
          padding-left: 20px;
          line-height: 1.6;
        }

        .gas-instructions-box a {
          color: #34d399;
          text-decoration: underline;
        }

        .code-copy-wrapper {
          position: relative;
        }

        .copy-code-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #3b82f6;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }

        .gas-code-block {
          background: #020617;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 18px;
          font-family: monospace;
          font-size: 0.78rem;
          color: #a5f3fc;
          max-height: 340px;
          overflow-y: auto;
          white-space: pre;
          margin: 0;
        }

        /* Markdown rendered styling inside preview and modal */
        .markdown-rendered h1, .markdown-rendered h2, .markdown-rendered h3 {
          color: #ffffff;
          margin-top: 20px;
          margin-bottom: 10px;
        }

        .markdown-rendered p {
          color: #cbd5e1;
          line-height: 1.65;
          margin-bottom: 14px;
        }

        .markdown-rendered a {
          color: #38bdf8;
          text-decoration: underline;
          font-weight: 600;
        }

        .markdown-rendered blockquote {
          border-left: 4px solid #3b82f6;
          padding: 8px 16px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 4px;
          color: #e2e8f0;
          margin: 16px 0;
        }

        .markdown-rendered pre {
          background: #090d16;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 14px;
          overflow-x: auto;
          color: #f8fafc;
        }

        .markdown-rendered table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }

        .markdown-rendered th, .markdown-rendered td {
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 12px;
          text-align: left;
          font-size: 0.85rem;
        }

        .markdown-rendered th {
          background: rgba(30, 41, 59, 0.8);
          color: #ffffff;
        }

        .seo-alert-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          border-radius: 10px;
          margin-bottom: 18px;
          font-size: 0.88rem;
          font-weight: 500;
          position: relative;
        }

        .seo-alert-box.success {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .seo-alert-box.error {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .seo-alert-box.warning {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .alert-close {
          margin-left: auto;
          background: transparent;
          border: none;
          color: inherit;
          font-size: 1.2rem;
          cursor: pointer;
        }

        /* Manual Publishing Helper & Copy Cards */
        .manual-publishing-helper {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .helper-lead-banner {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 12px;
          padding: 16px 20px;
          color: #e2e8f0;
        }

        .lead-icon {
          color: #38bdf8;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .helper-lead-banner strong {
          display: block;
          font-size: 0.95rem;
          color: #38bdf8;
          margin-bottom: 4px;
        }

        .helper-lead-banner p {
          margin: 0;
          font-size: 0.84rem;
          color: #94a3b8;
          line-height: 1.5;
        }

        .manual-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
        }

        .manual-platform-card {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .manual-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .platform-badge-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .platform-badge-group h4 {
          margin: 0;
          font-size: 0.98rem;
          color: #ffffff;
        }

        .platform-badge-group small {
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .editor-launch-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.76rem;
          font-weight: 600;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: 5px 10px;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .editor-launch-btn:hover {
          background: rgba(56, 189, 248, 0.2);
          color: #ffffff;
        }

        .manual-card-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .manual-instructions {
          font-size: 0.82rem;
          color: #cbd5e1;
          margin: 0;
          line-height: 1.45;
        }

        .manual-instructions code {
          background: rgba(255, 255, 255, 0.08);
          padding: 2px 5px;
          border-radius: 4px;
          color: #38bdf8;
        }

        .manual-btn-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .copy-snippet-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(30, 41, 59, 0.7);
          color: #f1f5f9;
          transition: all 0.2s ease;
        }

        .copy-snippet-btn:hover {
          background: rgba(51, 65, 85, 0.9);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .copy-snippet-btn.primary {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-color: #3b82f6;
          color: #ffffff;
        }

        .copy-snippet-btn.primary:hover {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
        }

        .payload-preview-box {
          background: #020617;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 12px;
          font-size: 0.76rem;
        }

        .payload-preview-box .box-label {
          display: block;
          color: #94a3b8;
          font-size: 0.72rem;
          margin-bottom: 6px;
          font-weight: 500;
        }

        .payload-preview-box pre {
          margin: 0;
          white-space: pre-wrap;
          font-family: monospace;
          color: #a5f3fc;
          max-height: 120px;
          overflow-y: auto;
        }

        .payload-preview-box code {
          color: #38bdf8;
          word-break: break-all;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .seo-loading-screen {
          min-height: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}

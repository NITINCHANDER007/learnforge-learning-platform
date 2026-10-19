import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Shield,
  Users,
  CheckCircle,
  Bookmark,
  FileText,
  BookOpen,
  Search,
  Plus,
  Trash2,
  Pin,
  Mail,
  MessageSquare,
  Send,
  RefreshCw,
  Key,
  Server,
  Database,
  Activity,
  ExternalLink,
  X,
  Phone,
  Ban,
  Check,
  AlertCircle,
  Layers,
  ArrowRight,
  Award,
  Share2
} from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'users' | 'database' | 'notifications' | 'notes'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [databaseInfo, setDatabaseInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [lessonNotes, setLessonNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // User search/filter
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Block User Modal
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);
  const [blockReasonInput, setBlockReasonInput] = useState('');
  const [blockSubmitting, setBlockSubmitting] = useState(false);

  // Remove/Delete User Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Reset Password Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState({ text: '', type: '' });

  // User Progress Modal State
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [inspectingUser, setInspectingUser] = useState(null);
  const [inspectingProgress, setInspectingProgress] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // MongoDB Connection State
  const [mongoUriInput, setMongoUriInput] = useState('');
  const [testingConn, setTestingConn] = useState(false);
  const [testConnFeedback, setTestConnFeedback] = useState(null);
  const [switchingDb, setSwitchingDb] = useState(false);
  const [switchDbFeedback, setSwitchDbFeedback] = useState(null);
  const [pingingDb, setPingingDb] = useState(false);

  // Test Notification Dispatcher
  const [notifChannel, setNotifChannel] = useState('email');
  const [notifRecipient, setNotifRecipient] = useState('');
  const [notifSubject, setNotifSubject] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSending, setNotifSending] = useState(false);
  const [notifFeedback, setNotifFeedback] = useState(null);

  // New Lesson Note form
  const [noteLessonPath, setNoteLessonPath] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [notePinned, setNotePinned] = useState(false);
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const loadAll = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [sRes, uRes, nRes, notifRes, dbRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getLessonNotes(),
        api.getAdminNotifications(),
        api.getDatabaseStatus().catch(() => ({ success: false }))
      ]);

      if (sRes.success) setStats(sRes.stats);
      if (uRes.success) setUsers(uRes.users);
      if (nRes.success) setLessonNotes(nRes.notes);
      if (notifRes.success) setNotifications(notifRes.notifications);
      if (dbRes.success) {
        setDatabaseInfo(dbRes.database);
        setMongoUriInput(prev => prev || dbRes.database.uri || 'mongodb://127.0.0.1:27017/datadrix');
      }
    } catch (e) {
      console.error('Admin load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Real-time automatic synchronization
  useEffect(() => {
    if (!autoSync) return;
    const timer = setInterval(() => {
      loadAll(true);
    }, 10000);
    return () => clearInterval(timer);
  }, [autoSync, loadAll]);

  // Refresh DB status only
  const refreshDbStatus = async () => {
    setPingingDb(true);
    try {
      const res = await api.getDatabaseStatus();
      if (res.success) {
        setDatabaseInfo(res.database);
      }
    } catch (e) {
      console.error('Failed refreshing DB status:', e);
    } finally {
      setPingingDb(false);
    }
  };

  // Test connection to arbitrary MongoDB URI
  const handleTestDatabaseConnection = async () => {
    if (!mongoUriInput.trim()) return;
    setTestingConn(true);
    setTestConnFeedback(null);
    setSwitchDbFeedback(null);

    try {
      const res = await api.testDatabaseConnection(mongoUriInput.trim());
      if (res.success) {
        setTestConnFeedback({
          type: 'success',
          text: `Connection verified! Host: ${res.result.host}/${res.result.name} · Ping: ${res.result.pingMs}ms · Collections: ${res.result.collectionsCount}`
        });
      }
    } catch (err) {
      setTestConnFeedback({
        type: 'error',
        text: err.message
      });
    } finally {
      setTestingConn(false);
    }
  };

  // Reconnect / Switch to new MongoDB URI
  const handleSwitchDatabase = async () => {
    if (!mongoUriInput.trim()) return;
    if (!window.confirm(`Are you sure you want to switch the platform database to:\n${mongoUriInput.trim()}?`)) return;

    setSwitchingDb(true);
    setSwitchDbFeedback(null);
    setTestConnFeedback(null);

    try {
      const res = await api.reconnectDatabase(mongoUriInput.trim());
      if (res.success) {
        setSwitchDbFeedback({
          type: 'success',
          text: res.message || 'Successfully connected and switched to new MongoDB database!'
        });
        loadAll(true);
      }
    } catch (err) {
      setSwitchDbFeedback({
        type: 'error',
        text: err.message
      });
    } finally {
      setSwitchingDb(false);
    }
  };

  // Ping current DB
  const handlePingDatabase = async () => {
    setPingingDb(true);
    try {
      const res = await api.pingDatabase();
      if (res.success) {
        setDatabaseInfo(prev => (prev ? { ...prev, pingMs: res.pingMs } : prev));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setPingingDb(false);
    }
  };

  // Block / Unblock User
  const handleBlockUserSubmit = async (e) => {
    e.preventDefault();
    if (!userToBlock) return;
    setBlockSubmitting(true);

    try {
      const res = await api.blockAdminUser(userToBlock._id, {
        isBlocked: !userToBlock.isBlocked,
        blockReason: blockReasonInput.trim()
      });

      if (res.success) {
        setUsers(prev => prev.map(u => (u._id === userToBlock._id ? res.user : u)));
        setShowBlockModal(false);
        setUserToBlock(null);
        setBlockReasonInput('');
        loadAll(true);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setBlockSubmitting(false);
    }
  };

  // Quick 1-click unblock
  const handleQuickUnblock = async (user) => {
    try {
      const res = await api.blockAdminUser(user._id, { isBlocked: false, blockReason: '' });
      if (res.success) {
        setUsers(prev => prev.map(u => (u._id === user._id ? res.user : u)));
        loadAll(true);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete / Remove user
  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;
    setDeleteSubmitting(true);

    try {
      const res = await api.deleteAdminUser(userToDelete._id);
      if (res.success) {
        setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
        setShowDeleteModal(false);
        setUserToDelete(null);
        loadAll(true);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Toggle user role
  const handleToggleUserRole = async (user) => {
    const newRole = user.role === 'admin' ? 'student' : 'admin';
    if (!window.confirm(`Change ${user.name}'s role to ${newRole.toUpperCase()}?`)) return;

    try {
      const res = await api.updateUserRoleStatus(user._id, { role: newRole });
      if (res.success) {
        setUsers(prev => prev.map(u => (u._id === user._id ? { ...u, role: newRole } : u)));
        loadAll(true);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Create new user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!newUserName.trim() || (!newUserEmail.trim() && !newUserPhone.trim()) || !newUserPassword) {
      setCreateError('Name, password, and at least an email or mobile phone number are required.');
      return;
    }

    setCreateSubmitting(true);
    try {
      const res = await api.createAdminUser({
        name: newUserName.trim(),
        email: newUserEmail.trim() || undefined,
        phone: newUserPhone.trim() || undefined,
        password: newUserPassword,
        role: newUserRole
      });

      if (res.success) {
        setCreateSuccess(`User "${res.user.name}" created successfully!`);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPhone('');
        setNewUserPassword('');
        setNewUserRole('student');
        loadAll(true);
        setTimeout(() => {
          setShowCreateModal(false);
          setCreateSuccess('');
        }, 1200);
      }
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Admin resets password for user
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserForReset || !newPasswordInput || newPasswordInput.length < 6) {
      setResetMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    setResetSubmitting(true);
    setResetMessage({ text: '', type: '' });
    try {
      const res = await api.resetAdminUserPassword(selectedUserForReset._id, newPasswordInput);
      if (res.success) {
        setResetMessage({ text: res.message, type: 'success' });
        setTimeout(() => {
          setShowResetModal(false);
          setSelectedUserForReset(null);
          setNewPasswordInput('');
          setResetMessage({ text: '', type: '' });
        }, 1500);
      }
    } catch (err) {
      setResetMessage({ text: err.message, type: 'error' });
    } finally {
      setResetSubmitting(false);
    }
  };

  // Inspect student curriculum progress breakdown
  const handleInspectUserProgress = async (targetUser) => {
    setInspectingUser(targetUser);
    setShowProgressModal(true);
    setLoadingProgress(true);
    setInspectingProgress(null);
    try {
      const res = await api.getUserProgress(targetUser._id);
      if (res.success) {
        setInspectingProgress(res.progress);
      }
    } catch (err) {
      console.error('Failed to load user progress:', err);
    } finally {
      setLoadingProgress(false);
    }
  };

  // Send Test Notification
  const handleSendTestNotification = async (e) => {
    e.preventDefault();
    if (!notifRecipient.trim() || !notifMessage.trim()) {
      setNotifFeedback({ type: 'error', text: 'Recipient and message body are required.' });
      return;
    }

    setNotifSending(true);
    setNotifFeedback(null);
    try {
      const res = await api.sendAdminNotification({
        channel: notifChannel,
        recipient: notifRecipient.trim(),
        subject: notifSubject.trim() || undefined,
        message: notifMessage.trim()
      });

      if (res.success) {
        const preview = res.result?.previewUrl;
        setNotifFeedback({
          type: 'success',
          text: `Notification successfully sent via ${notifChannel.toUpperCase()}!`,
          previewUrl: preview
        });
        setNotifRecipient('');
        setNotifSubject('');
        setNotifMessage('');
        const updated = await api.getAdminNotifications();
        if (updated.success) setNotifications(updated.notifications);
      }
    } catch (err) {
      setNotifFeedback({ type: 'error', text: err.message });
    } finally {
      setNotifSending(false);
    }
  };

  // Create official lesson note
  const handleCreateLessonNote = async (e) => {
    e.preventDefault();
    if (!noteLessonPath.trim() || !noteTitle.trim()) return;
    setNoteSubmitting(true);

    try {
      const res = await api.createLessonNote({
        lessonPath: noteLessonPath.trim(),
        title: noteTitle.trim(),
        body: noteBody,
        pinned: notePinned
      });
      if (res.success) {
        setLessonNotes(prev => [res.note, ...prev]);
        setNoteLessonPath('');
        setNoteTitle('');
        setNoteBody('');
        setNotePinned(false);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setNoteSubmitting(false);
    }
  };

  // Delete official lesson note
  const handleDeleteLessonNote = async (id) => {
    if (!window.confirm('Delete this official lesson note?')) return;
    try {
      await api.deleteLessonNote(id);
      setLessonNotes(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase().trim();
    const matchesQ =
      !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q));

    const matchesRole = !roleFilter || u.role === roleFilter;

    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = u.isActive && !u.isBlocked;
    } else if (statusFilter === 'blocked') {
      matchesStatus = u.isBlocked || !u.isActive;
    }

    return matchesQ && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner-glow"></div>
        <p>Connecting to DataDrix Administration Hub...</p>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Top Banner */}
      <div className="admin-header glass-panel">
        <div className="admin-title-group">
          <div className="admin-shield-badge">
            <Shield size={28} />
          </div>
          <div>
            <div className="admin-title-row">
              <h1>Platform Administration Hub</h1>
              <span className="live-status-pill">
                <span className="live-dot"></span> System Live
              </span>
            </div>
            <p className="admin-header-subtitle">
              Manage accounts, connect MongoDB, remove or block users, and inspect server communications.
            </p>
          </div>
        </div>

        <div className="admin-header-controls">
          <button
            type="button"
            className={`btn btn-sm ${autoSync ? 'btn-primary' : 'btn-secondary'} auto-sync-toggle`}
            onClick={() => setAutoSync(!autoSync)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title={autoSync ? 'Live real-time sync is active (every 10s)' : 'Click to enable real-time auto-sync'}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: autoSync ? '#10b981' : '#64748b',
              boxShadow: autoSync ? '0 0 8px #10b981' : 'none',
              display: 'inline-block'
            }}></span>
            <span>{autoSync ? 'Live Sync' : 'Sync Paused'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm refresh-btn"
            onClick={() => loadAll(true)}
            disabled={refreshing}
            title="Refresh All Data"
          >
            <RefreshCw size={14} className={refreshing ? 'spin-icon' : ''} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>

          <div className="admin-tabs">
            <button
              type="button"
              className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <Activity size={15} /> Metrics
            </button>
            <button
              type="button"
              className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={15} /> Users ({users.length})
            </button>
            <button
              type="button"
              className={`admin-tab ${activeTab === 'database' ? 'active' : ''}`}
              onClick={() => setActiveTab('database')}
            >
              <Database size={15} /> MongoDB Database
            </button>
            <button
              type="button"
              className={`admin-tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Mail size={15} /> Notifications ({notifications.length})
            </button>
            <button
              type="button"
              className={`admin-tab ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              <FileText size={15} /> Notes ({lessonNotes.length})
            </button>
            <Link
              to="/admin/seo-backlinks"
              className="admin-tab"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none'
              }}
              title="Automated SEO Backlink Engine & Multi-Platform Publisher"
            >
              <Share2 size={15} /> SEO Backlinks Engine
            </Link>
          </div>
        </div>
      </div>

      {/* TAB 1: SYSTEM METRICS & HEALTH */}
      {activeTab === 'stats' && (
        <div className="admin-stats-layout">
          {/* Key Metric KPI Cards */}
          <div className="metrics-cards-row">
            <div className="admin-metric-card glass-panel">
              <div className="metric-card-header">
                <span className="metric-label">Total Registered Users</span>
                <Users size={18} className="metric-icon users-icon" />
              </div>
              <span className="metric-val">{stats?.totalUsers || 0}</span>
              <span className="metric-sub">
                <strong style={{ color: '#38bdf8' }}>{stats?.totalStudents || 0}</strong> students ·{' '}
                <strong style={{ color: '#fbbf24' }}>{stats?.totalAdmins || 0}</strong> admins
              </span>
            </div>

            <div className="admin-metric-card glass-panel">
              <div className="metric-card-header">
                <span className="metric-label">Curriculum Depth</span>
                <BookOpen size={18} className="metric-icon lessons-icon" />
              </div>
              <span className="metric-val">{stats?.totalLessons || 166}</span>
              <span className="metric-sub">Across {stats?.totalSubjects || 14} learning paths</span>
            </div>

            <div className="admin-metric-card glass-panel">
              <div className="metric-card-header">
                <span className="metric-label">Lesson Completions</span>
                <CheckCircle size={18} className="metric-icon complete-icon" />
              </div>
              <span className="metric-val">{stats?.totalCompletions || 0}</span>
              <span className="metric-sub">Modules completed by learners</span>
            </div>

            <div className="admin-metric-card glass-panel">
              <div className="metric-card-header">
                <span className="metric-label">Saved Bookmarks</span>
                <Bookmark size={18} className="metric-icon bookmark-icon" />
              </div>
              <span className="metric-val">{stats?.totalBookmarks || 0}</span>
              <span className="metric-sub">Bookmarked for fast revision</span>
            </div>

            <div className="admin-metric-card glass-panel">
              <div className="metric-card-header">
                <span className="metric-label">Private Study Notes</span>
                <FileText size={18} className="metric-icon note-icon" />
              </div>
              <span className="metric-val">{stats?.totalNotes || 0}</span>
              <span className="metric-sub">Saved in personal notes vault</span>
            </div>
          </div>

          {/* Quick MongoDB Status Banner */}
          <div className="infra-card glass-panel">
            <div className="infra-header">
              <div className="infra-title">
                <Database size={18} />
                <span>MongoDB Database Connection</span>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setActiveTab('database')}
              >
                Configure MongoDB →
              </button>
            </div>
            <div className="infra-grid">
              <div className="infra-item">
                <Database size={16} className="infra-icon" />
                <div>
                  <span className="infra-item-label">Database Name</span>
                  <strong className="infra-item-value">{databaseInfo?.name || 'datadrix'}</strong>
                </div>
              </div>
              <div className="infra-item">
                <Activity size={16} className="infra-icon" />
                <div>
                  <span className="infra-item-label">Status & Ping</span>
                  <strong className="infra-item-value" style={{ color: '#10b981' }}>
                    ● Connected ({databaseInfo?.pingMs !== undefined ? `${databaseInfo.pingMs} ms` : '1 ms'})
                  </strong>
                </div>
              </div>
              <div className="infra-item">
                <Server size={16} className="infra-icon" />
                <div>
                  <span className="infra-item-label">Host / Endpoint</span>
                  <strong className="infra-item-value">{databaseInfo?.host || '127.0.0.1:27017'}</strong>
                </div>
              </div>
              <div className="infra-item">
                <Layers size={16} className="infra-icon" />
                <div>
                  <span className="infra-item-label">Collections</span>
                  <strong className="infra-item-value">{databaseInfo?.collections?.length || 5} active collections</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column Detail Area: Popular Lessons & Recent Registrations */}
          <div className="stats-detail-grid">
            {/* Top Bookmarked Lessons */}
            <div className="stats-box glass-panel">
              <div className="stats-box-header">
                <h3>Top Bookmarked Lessons</h3>
                <span className="badge badge-primary">Most Popular</span>
              </div>

              {stats?.topBookmarked && stats.topBookmarked.length > 0 ? (
                <div className="bookmarked-table">
                  {stats.topBookmarked.map((item, i) => (
                    <div key={item.lessonPath} className="bookmarked-row">
                      <span className="rank-num">#{i + 1}</span>
                      <div className="bookmarked-info">
                        <Link to={`/${item.subjectSlug}/${item.lessonSlug}`} className="bookmarked-title-link">
                          {item.title}
                        </Link>
                        <span className="bookmarked-path">{item.lessonPath}</span>
                      </div>
                      <span className="badge badge-primary">{item.count} saved</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No student bookmarks logged yet.</p>
              )}
            </div>

            {/* Recent Registrations */}
            <div className="stats-box glass-panel">
              <div className="stats-box-header">
                <h3>Recent Registrations</h3>
                <span className="badge badge-success">Latest Signups</span>
              </div>

              {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                <div className="recent-users-list">
                  {stats.recentUsers.map((u) => (
                    <div key={u._id} className="recent-user-row">
                      <div className="table-avatar">{u.name?.charAt(0).toUpperCase() || 'U'}</div>
                      <div className="recent-user-info">
                        <strong>{u.name}</strong>
                        <span className="recent-user-contact">
                          {u.email || u.phone || 'No direct contact'}
                        </span>
                      </div>
                      <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-secondary'}`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No user registrations recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT (REMOVE & BLOCK/UNBLOCK) */}
      {activeTab === 'users' && (
        <div className="admin-users-layout glass-panel">
          <div className="users-filter-bar">
            <div className="search-input-wrap">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by name, email, or mobile..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <div className="filter-controls-right">
              <div className="filter-selects">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="">All Roles</option>
                  <option value="student">Students</option>
                  <option value="admin">Administrators</option>
                </select>

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="blocked">Blocked / Suspended</option>
                </select>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setCreateError('');
                  setCreateSuccess('');
                  setShowCreateModal(true);
                }}
              >
                <Plus size={16} /> Add New User
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Learning Progress</th>
                  <th>Account Status</th>
                  <th>Joined Date</th>
                  <th>Admin Controls</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => {
                    const isUserBlocked = u.isBlocked || !u.isActive;
                    return (
                      <tr key={u._id} className={isUserBlocked ? 'row-blocked' : ''}>
                        <td>
                          <div className="user-name-col">
                            <div className={`table-avatar ${isUserBlocked ? 'avatar-blocked' : ''}`}>
                              {u.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <strong>{u.name}</strong>
                              {u.blockReason && (
                                <span className="block-reason-hint" title={u.blockReason}>
                                  Reason: {u.blockReason}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="user-contact-col">
                            {u.email && <span className="contact-text email-text">{u.email}</span>}
                            {u.phone && (
                              <span className="contact-text phone-text">
                                <Phone size={11} style={{ display: 'inline', marginRight: 4 }} />
                                {u.phone}
                              </span>
                            )}
                            {!u.email && !u.phone && <span className="contact-missing-badge">No Contact</span>}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-primary'}`}>
                            {u.role}
                          </span>
                        </td>
                        {/* User Learning Progress Column */}
                        <td>
                          <div
                            className="user-progress-cell"
                            onClick={() => handleInspectUserProgress(u)}
                            title="Click to inspect detailed curriculum breakdown"
                          >
                            <div className="progress-cell-header">
                              <span className="progress-cell-counts">
                                <strong>{u.progress?.completedCount || 0}</strong> / {u.progress?.totalLessons || 166}
                              </span>
                              <span className="progress-cell-badge">
                                {u.progress?.percent || 0}%
                              </span>
                            </div>
                            <div className="table-progressbar-track">
                              <div
                                className="table-progressbar-fill"
                                style={{
                                  width: `${Math.min(100, u.progress?.percent || 0)}%`,
                                  background: (u.progress?.percent || 0) >= 70
                                    ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                                    : (u.progress?.percent || 0) >= 25
                                    ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                                    : 'linear-gradient(90deg, #3b82f6, #6366f1)'
                                }}
                              />
                            </div>
                            {u.progress?.lastCompletedAt && (
                              <span className="progress-cell-sub">
                                Last active: {new Date(u.progress.lastCompletedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {isUserBlocked ? (
                            <span className="badge badge-danger">
                              <Ban size={12} /> Blocked
                            </span>
                          ) : (
                            <span className="badge badge-success">
                              <Check size={12} /> Active
                            </span>
                          )}
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons-group">
                            {/* Inspect User Progress */}
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm action-btn"
                              onClick={() => handleInspectUserProgress(u)}
                              title="Inspect curriculum and lesson progress"
                            >
                              <Award size={13} color="#818cf8" />
                              <span>Progress</span>
                            </button>

                            {/* Block / Unblock Button */}
                            {isUserBlocked ? (
                              <button
                                type="button"
                                className="btn btn-success-outline btn-sm action-btn"
                                onClick={() => handleQuickUnblock(u)}
                                title="Unblock user and restore platform access"
                              >
                                <Check size={13} />
                                <span>Unblock</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-danger-outline btn-sm action-btn"
                                onClick={() => {
                                  setUserToBlock(u);
                                  setBlockReasonInput('');
                                  setShowBlockModal(true);
                                }}
                                title="Block user from logging in or using the platform"
                              >
                                <Ban size={13} />
                                <span>Block</span>
                              </button>
                            )}

                            {/* Toggle Role */}
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm action-btn"
                              onClick={() => handleToggleUserRole(u)}
                              title="Toggle Role"
                            >
                              {u.role === 'admin' ? 'Make Student' : 'Promote Admin'}
                            </button>

                            {/* Reset Password */}
                            <button
                              type="button"
                              className="btn btn-outline btn-sm action-btn icon-only"
                              onClick={() => {
                                setSelectedUserForReset(u);
                                setNewPasswordInput('');
                                setResetMessage({ text: '', type: '' });
                                setShowResetModal(true);
                              }}
                              title="Reset Password"
                            >
                              <Key size={13} />
                            </button>

                            {/* Remove / Delete User */}
                            <button
                              type="button"
                              className="btn btn-danger-outline btn-sm action-btn delete-user-btn"
                              onClick={() => {
                                setUserToDelete(u);
                                setShowDeleteModal(true);
                              }}
                              title="Permanently remove user from MongoDB"
                            >
                              <Trash2 size={13} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="empty-table-cell">
                      No users match your search query or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MONGODB DATABASE CONNECTION & EXPLORER */}
      {activeTab === 'database' && (
        <div className="admin-db-layout">
          {/* Active Connection Status Card */}
          <div className="db-status-card glass-panel">
            <div className="card-top-header">
              <div>
                <div className="db-status-title-row">
                  <Database size={22} className="db-brand-icon" />
                  <h3>Active MongoDB Connection</h3>
                  <span className={`status-pill ${databaseInfo?.connected ? 'connected' : 'disconnected'}`}>
                    <span className="live-dot"></span> {databaseInfo?.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <p className="card-sub">
                  Inspect the live database connection, monitor latency, test queries, or connect to an external MongoDB Atlas cluster.
                </p>
              </div>

              <div className="db-header-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handlePingDatabase}
                  disabled={pingingDb}
                >
                  <Activity size={14} className={pingingDb ? 'spin-icon' : ''} />
                  <span>{pingingDb ? 'Pinging...' : 'Ping Latency'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={refreshDbStatus}
                  disabled={pingingDb}
                >
                  <RefreshCw size={14} className={pingingDb ? 'spin-icon' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="db-stats-metrics-row">
              <div className="db-metric-box">
                <span className="metric-box-label">Database Name</span>
                <strong className="metric-box-val">{databaseInfo?.name || 'datadrix'}</strong>
              </div>
              <div className="db-metric-box">
                <span className="metric-box-label">Host & Port</span>
                <strong className="metric-box-val">{databaseInfo?.host || '127.0.0.1'}:{databaseInfo?.port || 27017}</strong>
              </div>
              <div className="db-metric-box">
                <span className="metric-box-label">Round-Trip Latency</span>
                <strong className="metric-box-val" style={{ color: '#10b981' }}>
                  {databaseInfo?.pingMs !== undefined && databaseInfo?.pingMs >= 0 ? `${databaseInfo.pingMs} ms` : '< 1 ms'}
                </strong>
              </div>
              <div className="db-metric-box">
                <span className="metric-box-label">Connection String (URI)</span>
                <code className="metric-box-uri">{databaseInfo?.uri || 'mongodb://127.0.0.1:27017/datadrix'}</code>
              </div>
            </div>
          </div>

          {/* Connect / Switch MongoDB Database Card */}
          <div className="db-connect-card glass-panel">
            <div className="card-top-header">
              <div>
                <h3>Connect & Switch MongoDB Database</h3>
                <p className="card-sub">
                  Connect to a different local MongoDB instance or a remote cloud cluster like <strong>MongoDB Atlas</strong>.
                </p>
              </div>
              <span className="badge badge-primary">Dynamic Reconnect</span>
            </div>

            <div className="db-uri-form">
              <div className="form-group">
                <label>MongoDB Connection URI</label>
                <input
                  type="text"
                  className="form-input db-uri-input"
                  value={mongoUriInput}
                  onChange={(e) => setMongoUriInput(e.target.value)}
                  placeholder="mongodb://127.0.0.1:27017/datadrix or mongodb+srv://<user>:<password>@cluster.mongodb.net/dbname"
                />
                <span className="input-hint">
                  Supports standard <code>mongodb://</code> and Atlas <code>mongodb+srv://</code> connection formats.
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="preset-buttons-row">
                <span className="preset-label">Quick Presets:</span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm preset-btn"
                  onClick={() => setMongoUriInput('mongodb://127.0.0.1:27017/datadrix')}
                >
                  Local Default (datadrix)
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm preset-btn"
                  onClick={() => setMongoUriInput('mongodb://127.0.0.1:27017/datadrix_production')}
                >
                  Local Production (datadrix_production)
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm preset-btn"
                  onClick={() => setMongoUriInput('mongodb+srv://admin:password@cluster0.mongodb.net/datadrix?retryWrites=true&w=majority')}
                >
                  MongoDB Atlas Example
                </button>
              </div>

              {testConnFeedback && (
                <div className={`db-feedback-box ${testConnFeedback.type}`}>
                  <span>{testConnFeedback.text}</span>
                </div>
              )}

              {switchDbFeedback && (
                <div className={`db-feedback-box ${switchDbFeedback.type}`}>
                  <span>{switchDbFeedback.text}</span>
                </div>
              )}

              <div className="db-actions-row">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleTestDatabaseConnection}
                  disabled={testingConn || switchingDb}
                >
                  <Activity size={15} />
                  <span>{testingConn ? 'Testing Connection...' : '🔍 Test Connection'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSwitchDatabase}
                  disabled={testingConn || switchingDb}
                >
                  <ArrowRight size={15} />
                  <span>{switchingDb ? 'Switching Database...' : '⚡ Connect & Switch Database'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* MongoDB Collections & Document Counts */}
          <div className="db-collections-card glass-panel">
            <div className="card-top-header">
              <div>
                <h3>Database Collections & Document Inventory</h3>
                <p className="card-sub">
                  Live record count stored in the connected MongoDB database.
                </p>
              </div>
              <span className="badge badge-success">
                {databaseInfo?.collections?.length || 0} Collections in "{databaseInfo?.name || 'datadrix'}"
              </span>
            </div>

            <div className="collections-grid">
              {databaseInfo?.collections && databaseInfo.collections.length > 0 ? (
                databaseInfo.collections.map((col) => (
                  <div key={col.name} className="collection-card">
                    <div className="col-header">
                      <Layers size={18} className="col-icon" />
                      <strong className="col-name">{col.name}</strong>
                    </div>
                    <div className="col-stats">
                      <span className="col-count-num">{col.count}</span>
                      <span className="col-count-sub">documents</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-text">No collections found in this database yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SERVER NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="admin-notifications-layout">
          {/* Dispatch Test Message Card */}
          <div className="notif-dispatch-card glass-panel">
            <div className="card-top-header">
              <div>
                <h3>Test Notification Dispatcher</h3>
                <p className="card-sub">
                  Trigger a live email or SMS from the server to verify your deliverability configuration.
                </p>
              </div>
              <span className="badge badge-primary">Real-Time Server Dispatch</span>
            </div>

            <form onSubmit={handleSendTestNotification} className="notif-form">
              <div className="channel-select-row">
                <button
                  type="button"
                  className={`channel-pill ${notifChannel === 'email' ? 'active' : ''}`}
                  onClick={() => setNotifChannel('email')}
                >
                  <Mail size={16} /> Email (Nodemailer / Ethereal)
                </button>
                <button
                  type="button"
                  className={`channel-pill ${notifChannel === 'sms' ? 'active' : ''}`}
                  onClick={() => setNotifChannel('sms')}
                >
                  <MessageSquare size={16} /> SMS (Twilio / Mobile)
                </button>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{notifChannel === 'email' ? 'Recipient Email Address' : 'Recipient Phone Number'}</label>
                  <input
                    type={notifChannel === 'email' ? 'email' : 'text'}
                    className="form-input"
                    value={notifRecipient}
                    onChange={(e) => setNotifRecipient(e.target.value)}
                    placeholder={notifChannel === 'email' ? 'user@example.com' : '+919876543210'}
                    required
                  />
                </div>

                {notifChannel === 'email' && (
                  <div className="form-group">
                    <label>Email Subject</label>
                    <input
                      type="text"
                      className="form-input"
                      value={notifSubject}
                      onChange={(e) => setNotifSubject(e.target.value)}
                      placeholder="e.g. DataDrix Platform Notification"
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Message Content</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Enter message to deliver via server..."
                  required
                />
              </div>

              {notifFeedback && (
                <div className={`notif-feedback-box ${notifFeedback.type}`}>
                  <span>{notifFeedback.text}</span>
                  {notifFeedback.previewUrl && (
                    <a
                      href={notifFeedback.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="preview-inbox-link"
                    >
                      <ExternalLink size={14} /> Open Ethereal Test Web Inbox
                    </a>
                  )}
                </div>
              )}

              <div className="form-action-row">
                <button type="submit" className="btn btn-primary" disabled={notifSending}>
                  <Send size={15} /> {notifSending ? 'Dispatching...' : 'Dispatch Message via Server'}
                </button>
              </div>
            </form>
          </div>

          {/* Live Dispatch Log Table */}
          <div className="notif-log-card glass-panel">
            <div className="card-top-header">
              <div>
                <h3>Server Notification Log</h3>
                <p className="card-sub">
                  Chronological record of recent emails and SMS sent by the server.
                </p>
              </div>
              <span className="badge badge-success">{notifications.length} Records</span>
            </div>

            <div className="table-responsive">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Channel</th>
                    <th>Recipient</th>
                    <th>Subject / Summary</th>
                    <th>Status</th>
                    <th>Inbox Preview</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <tr key={n.id}>
                        <td>
                          <span className={`badge ${n.channel === 'email' ? 'badge-primary' : 'badge-warning'}`}>
                            {n.channel === 'email' ? '✉️ Email' : '📱 SMS'}
                          </span>
                        </td>
                        <td>
                          <strong>{n.recipient}</strong>
                        </td>
                        <td>
                          <div className="notif-summary-col">
                            <span className="notif-subject">{n.subject || n.message || 'Notification'}</span>
                            {n.preview && <span className="notif-preview-text">{n.preview}</span>}
                          </div>
                        </td>
                        <td>
                          {n.delivered ? (
                            <span className="badge badge-success">✓ Delivered</span>
                          ) : n.simulated ? (
                            <span className="badge badge-primary">⚡ Logged</span>
                          ) : (
                            <span className="badge badge-danger">✗ Failed</span>
                          )}
                        </td>
                        <td>
                          {n.previewUrl ? (
                            <a
                              href={n.previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline btn-sm webmail-btn"
                            >
                              <ExternalLink size={12} /> View Webmail
                            </a>
                          ) : (
                            <span className="no-preview-text">—</span>
                          )}
                        </td>
                        <td>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="empty-table-cell">
                        No notifications dispatched during this session yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INSTRUCTOR NOTES */}
      {activeTab === 'notes' && (
        <div className="admin-notes-layout">
          {/* New Note Form */}
          <div className="new-note-card glass-panel">
            <div className="card-top-header">
              <div>
                <h3>Publish Official Instructor Note</h3>
                <p className="card-sub">
                  Official notes appear pinned at the top of lesson pages for all visiting students.
                </p>
              </div>
              <span className="badge badge-primary">Curriculum Pinned Errata</span>
            </div>

            <form onSubmit={handleCreateLessonNote} className="instructor-note-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Lesson Path (e.g. python/what-is-python or sql/select-queries)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={noteLessonPath}
                    onChange={(e) => setNoteLessonPath(e.target.value)}
                    placeholder="subject-slug/lesson-slug"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Note Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g. Important Python 3.12 syntax update"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Note Body (Markdown supported)</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="Instructor comments, tips, or errata for learners..."
                />
              </div>

              <div className="form-checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notePinned}
                    onChange={(e) => setNotePinned(e.target.checked)}
                  />
                  <span>Pin to top of lesson page</span>
                </label>

                <button type="submit" className="btn btn-primary" disabled={noteSubmitting}>
                  <Plus size={16} /> Publish Note
                </button>
              </div>
            </form>
          </div>

          {/* List of existing instructor notes */}
          <div className="notes-list-card glass-panel">
            <div className="card-top-header">
              <div>
                <h3>Active Instructor Notes</h3>
                <p className="card-sub">Manage or delete active lesson-level errata and announcements.</p>
              </div>
              <span className="badge badge-success">{lessonNotes.length} Notes</span>
            </div>

            {lessonNotes.length > 0 ? (
              <div className="instructor-notes-grid">
                {lessonNotes.map((n) => (
                  <div key={n._id} className="instructor-note-item">
                    <div className="item-top">
                      <span className="lesson-path-tag">{n.lessonPath}</span>
                      <div className="item-actions">
                        {n.pinned && (
                          <span className="badge badge-warning">
                            <Pin size={10} /> Pinned
                          </span>
                        )}
                        <button
                          type="button"
                          className="icon-btn delete-btn"
                          onClick={() => handleDeleteLessonNote(n._id)}
                          title="Delete note"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <h4>{n.title}</h4>
                    <p>{n.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">No official instructor notes published yet.</p>
            )}
          </div>
        </div>
      )}

      {/* USER PROGRESS INSPECTOR MODAL */}
      {showProgressModal && inspectingUser && (
        <div className="modal-backdrop" onClick={() => setShowProgressModal(false)}>
          <div className="modal-window glass-panel progress-inspector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Award size={22} className="modal-icon" color="#818cf8" />
                <div>
                  <h3>Student Progress Inspector</h3>
                  <span className="modal-user-subtitle">{inspectingUser.name} &bull; {inspectingUser.email || inspectingUser.phone || 'No contact'}</span>
                </div>
              </div>
              <button
                type="button"
                className="icon-button modal-close"
                onClick={() => setShowProgressModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body progress-modal-body">
              {/* Overall Progress Stat Box */}
              <div className="inspector-overview-box">
                <div className="inspector-overview-top">
                  <div>
                    <span className="inspector-label">Overall Curriculum Progress</span>
                    <h4>
                      <strong>{inspectingProgress?.completedCount ?? inspectingUser.progress?.completedCount ?? 0}</strong> / {inspectingProgress?.totalLessons ?? inspectingUser.progress?.totalLessons ?? 166} Lessons Completed
                    </h4>
                  </div>
                  <span className="inspector-badge">
                    {inspectingProgress?.percent ?? inspectingUser.progress?.percent ?? 0}%
                  </span>
                </div>
                <div className="inspector-progressbar-track">
                  <div
                    className="inspector-progressbar-fill"
                    style={{
                      width: `${inspectingProgress?.percent ?? inspectingUser.progress?.percent ?? 0}%`
                    }}
                  />
                </div>
              </div>

              {loadingProgress ? (
                <div className="inspector-loading">
                  <div className="spinner-glow" style={{ margin: '0 auto 12px' }}></div>
                  <p>Loading student curriculum breakdown...</p>
                </div>
              ) : (
                <>
                  {/* Subject Breakdown Grid */}
                  <h4 className="inspector-section-title">Track Completion Breakdown</h4>
                  <div className="inspector-tracks-grid">
                    {inspectingProgress?.subjectBreakdown?.map((sub) => (
                      <div key={sub.slug} className="inspector-track-item">
                        <div className="track-item-header">
                          <span className="track-item-title">{sub.icon} {sub.title}</span>
                          <span className="track-item-pct">{sub.completed} / {sub.total} ({sub.percent}%)</span>
                        </div>
                        <div className="track-progressbar">
                          <div
                            className="track-progressfill"
                            style={{
                              width: `${sub.percent}%`,
                              background: sub.percent === 100
                                ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                                : sub.percent > 0
                                ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                                : 'transparent'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent Lesson Completions */}
                  {inspectingProgress?.recentCompletions && inspectingProgress.recentCompletions.length > 0 && (
                    <div className="inspector-recent-box">
                      <h4 className="inspector-section-title">Recent Completed Lessons</h4>
                      <div className="inspector-completions-list">
                        {inspectingProgress.recentCompletions.map((rc, idx) => (
                          <div key={idx} className="inspector-completion-item">
                            <span className="completion-path">{rc.lessonPath}</span>
                            <span className="completion-date">{new Date(rc.completedAt).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowProgressModal(false)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-window glass-panel">
            <div className="modal-header">
              <div className="modal-title-row">
                <Users size={20} className="modal-icon" />
                <h3>Create New User Account</h3>
              </div>
              <button
                type="button"
                className="icon-button modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="modal-form">
              {createError && <div className="modal-alert-error">{createError}</div>}
              {createSuccess && <div className="modal-alert-success">{createSuccess}</div>}

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                  <span className="input-hint">Email or phone is mandatory</span>
                </div>

                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+919876543210"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                  />
                  <span className="input-hint">Optional if email entered</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Initial Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Assigned Role</label>
                  <select
                    className="form-input"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createSubmitting}>
                  {createSubmitting ? 'Creating User...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BLOCK USER MODAL */}
      {showBlockModal && userToBlock && (
        <div className="modal-backdrop">
          <div className="modal-window glass-panel">
            <div className="modal-header">
              <div className="modal-title-row">
                <Ban size={22} className="modal-icon" style={{ color: '#ef4444' }} />
                <h3>Block User: {userToBlock.name}</h3>
              </div>
              <button
                type="button"
                className="icon-button modal-close"
                onClick={() => {
                  setShowBlockModal(false);
                  setUserToBlock(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBlockUserSubmit} className="modal-form">
              <p className="modal-desc">
                Blocking <strong>{userToBlock.name}</strong> ({userToBlock.email || userToBlock.phone}) will immediately prevent them from logging in and accessing platform courses or playgrounds.
              </p>

              <div className="form-group">
                <label>Reason for Blocking (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Terms violation, automated spam, suspicious activity"
                  value={blockReasonInput}
                  onChange={(e) => setBlockReasonInput(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowBlockModal(false);
                    setUserToBlock(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: '#ef4444', borderColor: '#ef4444' }}
                  disabled={blockSubmitting}
                >
                  {blockSubmitting ? 'Blocking...' : 'Confirm Block User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REMOVE / DELETE USER MODAL */}
      {showDeleteModal && userToDelete && (
        <div className="modal-backdrop">
          <div className="modal-window glass-panel">
            <div className="modal-header">
              <div className="modal-title-row">
                <Trash2 size={22} className="modal-icon" style={{ color: '#ef4444' }} />
                <h3>Permanently Delete User</h3>
              </div>
              <button
                type="button"
                className="icon-button modal-close"
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-form">
              <div className="delete-warning-box">
                <AlertCircle size={20} />
                <span>
                  This action is irreversible. All student progress, lesson bookmarks, and private study notes associated with this account will be permanently deleted from MongoDB.
                </span>
              </div>

              <p className="modal-desc">
                Are you sure you want to remove user <strong>"{userToDelete.name}"</strong> (
                {userToDelete.email || userToDelete.phone})?
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ background: '#ef4444', borderColor: '#ef4444' }}
                  onClick={handleDeleteUserConfirm}
                  disabled={deleteSubmitting}
                >
                  {deleteSubmitting ? 'Removing User...' : 'Permanently Remove User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && selectedUserForReset && (
        <div className="modal-backdrop">
          <div className="modal-window glass-panel">
            <div className="modal-header">
              <div className="modal-title-row">
                <Key size={20} className="modal-icon" />
                <h3>Reset Password for {selectedUserForReset.name}</h3>
              </div>
              <button
                type="button"
                className="icon-button modal-close"
                onClick={() => {
                  setShowResetModal(false);
                  setSelectedUserForReset(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="modal-form">
              {resetMessage.text && (
                <div className={resetMessage.type === 'error' ? 'modal-alert-error' : 'modal-alert-success'}>
                  {resetMessage.text}
                </div>
              )}

              <p className="modal-desc">
                Set a new password for account <strong>{selectedUserForReset.email || selectedUserForReset.phone}</strong>.
              </p>

              <div className="form-group">
                <label>New Password (min 6 chars)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter new secure password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedUserForReset(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={resetSubmitting}>
                  {resetSubmitting ? 'Updating...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-page-container {
          max-width: 1360px;
          margin: 0 auto;
          padding: 36px 24px 80px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          width: 100%;
        }
        .admin-loading-screen {
          min-height: calc(100vh - 200px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: var(--text-secondary);
        }
        .spinner-glow {
          width: 44px;
          height: 44px;
          border: 3px solid rgba(99, 102, 241, 0.2);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 0.8s linear infinite;
        }
        .admin-header {
          padding: 28px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          border-radius: var(--radius-lg);
        }
        .admin-title-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .admin-shield-badge {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
          border: 1px solid rgba(99, 102, 241, 0.3);
        }
        .admin-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .admin-title-row h1 {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          margin: 0;
        }
        .live-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }
        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.9); }
        }
        .admin-header-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin: 4px 0 0;
        }
        .admin-header-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .admin-tabs {
          display: flex;
          gap: 6px;
          background: var(--bg-tertiary);
          padding: 5px;
          border-radius: var(--radius-full);
          flex-wrap: wrap;
        }
        .admin-tab {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .admin-tab.active {
          background: var(--accent-primary);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
        .metrics-cards-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
        }
        .admin-metric-card {
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-radius: var(--radius-lg);
          position: relative;
          overflow: hidden;
        }
        .metric-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .metric-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .metric-icon {
          padding: 4px;
          border-radius: 6px;
        }
        .metric-icon.users-icon { color: #38bdf8; background: rgba(56, 189, 248, 0.1); }
        .metric-icon.lessons-icon { color: #a78bfa; background: rgba(167, 139, 250, 0.1); }
        .metric-icon.complete-icon { color: #34d399; background: rgba(52, 211, 153, 0.1); }
        .metric-icon.bookmark-icon { color: #fbbf24; background: rgba(251, 191, 36, 0.1); }
        .metric-icon.note-icon { color: #f472b6; background: rgba(244, 114, 182, 0.1); }
        .metric-val {
          font-family: var(--font-display);
          font-size: 2.3rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .metric-sub {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .infra-card {
          padding: 22px 28px;
          margin-top: 18px;
          border-radius: var(--radius-lg);
        }
        .infra-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .infra-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 1.05rem;
        }
        .infra-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        .infra-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-tertiary);
          padding: 12px 16px;
          border-radius: var(--radius-md);
        }
        .infra-icon {
          color: var(--accent-primary);
        }
        .infra-item-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .infra-item-value {
          font-size: 0.95rem;
          color: var(--text-primary);
        }
        .stats-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 20px;
        }
        .stats-box {
          padding: 24px;
          border-radius: var(--radius-lg);
        }
        .stats-box-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }
        .stats-box-header h3 {
          font-family: var(--font-display);
          font-size: 1.15rem;
          margin: 0;
        }
        .bookmarked-table, .recent-users-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .bookmarked-row, .recent-user-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 14px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }
        .rank-num {
          font-weight: 800;
          color: var(--accent-primary);
          font-size: 1rem;
          width: 24px;
        }
        .bookmarked-info, .recent-user-info {
          flex: 1;
        }
        .bookmarked-title-link {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-primary);
          text-decoration: none;
          display: block;
        }
        .bookmarked-title-link:hover {
          color: var(--accent-primary);
        }
        .bookmarked-path, .recent-user-contact {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .admin-users-layout {
          padding: 28px;
          border-radius: var(--radius-lg);
        }
        .users-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .search-input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: 8px 14px;
          border-radius: var(--radius-md);
          min-width: 320px;
        }
        .search-input-wrap input {
          background: transparent;
          border: none;
          color: var(--text-primary);
          outline: none;
          width: 100%;
          font-size: 0.9rem;
        }
        .filter-controls-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .filter-selects {
          display: flex;
          gap: 10px;
        }
        .filter-selects select {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 8px 12px;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
        }
        .table-responsive {
          overflow-x: auto;
        }
        .users-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .users-table th {
          text-align: left;
          padding: 12px 14px;
          color: var(--text-muted);
          font-size: 0.78rem;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-color);
          letter-spacing: 0.05em;
        }
        .users-table td {
          padding: 13px 14px;
          border-bottom: 1px solid var(--border-color);
        }
        .row-blocked {
          background: rgba(239, 68, 68, 0.04);
        }
        .user-name-col {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .table-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--gradient-brand);
          color: white;
          font-size: 0.82rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .table-avatar.avatar-blocked {
          background: #475569;
          filter: grayscale(1);
        }
        .block-reason-hint {
          display: block;
          font-size: 0.72rem;
          color: #f87171;
          margin-top: 2px;
        }
        .user-progress-cell {
          cursor: pointer;
          min-width: 140px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 6px 8px;
          border-radius: var(--radius-sm);
          transition: background 0.2s ease;
        }
        .user-progress-cell:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        .progress-cell-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
        }
        .progress-cell-counts {
          color: var(--text-secondary);
        }
        .progress-cell-counts strong {
          color: var(--text-primary);
        }
        .progress-cell-badge {
          background: rgba(99, 102, 241, 0.18);
          color: #a5b4fc;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 9999px;
        }
        .progress-cell-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .table-progressbar-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          overflow: hidden;
        }
        .table-progressbar-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.6s ease;
        }
        .progress-inspector-modal {
          max-width: 680px;
          width: 95%;
        }
        .modal-user-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: normal;
        }
        .progress-modal-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-height: 70vh;
          overflow-y: auto;
          padding: 20px 24px;
        }
        .inspector-overview-box {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 16px 20px;
        }
        .inspector-overview-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .inspector-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .inspector-overview-top h4 {
          margin: 4px 0 0;
          font-size: 1.15rem;
        }
        .inspector-badge {
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.35);
          font-size: 0.85rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 9999px;
        }
        .inspector-progressbar-track {
          width: 100%;
          height: 10px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          overflow: hidden;
        }
        .inspector-progressbar-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #10b981);
          border-radius: 9999px;
          transition: width 0.6s ease;
        }
        .inspector-section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
        }
        .inspector-tracks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
        }
        .inspector-track-item {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 12px 14px;
        }
        .track-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 0.85rem;
        }
        .track-item-title {
          font-weight: 600;
        }
        .track-item-pct {
          color: var(--text-muted);
          font-size: 0.78rem;
        }
        .track-progressbar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          overflow: hidden;
        }
        .track-progressfill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.5s ease;
        }
        .inspector-recent-box {
          margin-top: 8px;
        }
        .inspector-completions-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 160px;
          overflow-y: auto;
        }
        .inspector-completion-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 12px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
        }
        .completion-path {
          color: var(--text-primary);
          font-family: var(--font-mono);
        }
        .completion-date {
          color: var(--text-muted);
          font-size: 0.75rem;
        }
        .inspector-loading {
          padding: 30px;
          text-align: center;
          color: var(--text-secondary);
        }
        .user-contact-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .contact-text.email-text {
          color: var(--text-primary);
          font-size: 0.85rem;
        }
        .contact-text.phone-text {
          color: #38bdf8;
          font-family: var(--font-mono);
          font-size: 0.8rem;
        }
        .contact-missing-badge {
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.04);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .action-buttons-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          font-size: 0.78rem;
          font-weight: 600;
        }
        .action-btn.icon-only {
          padding: 6px;
        }
        .btn-danger-outline {
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #f87171;
          background: transparent;
        }
        .btn-danger-outline:hover {
          background: rgba(239, 68, 68, 0.15);
        }
        .delete-user-btn:hover {
          background: rgba(239, 68, 68, 0.25) !important;
          color: #ffffff;
        }
        .btn-success-outline {
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
          background: transparent;
        }
        .btn-success-outline:hover {
          background: rgba(16, 185, 129, 0.15);
        }
        .empty-table-cell {
          text-align: center;
          padding: 32px !important;
          color: var(--text-muted);
        }

        /* Database Tab Styles */
        .admin-db-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .db-status-card, .db-connect-card, .db-collections-card {
          padding: 28px;
          border-radius: var(--radius-lg);
        }
        .db-status-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .db-brand-icon {
          color: #10b981;
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }
        .status-pill.connected {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .status-pill.disconnected {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .db-header-actions {
          display: flex;
          gap: 10px;
        }
        .db-stats-metrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }
        .db-metric-box {
          background: var(--bg-tertiary);
          padding: 16px 20px;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 4px;
          border: 1px solid var(--border-color);
        }
        .metric-box-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
        }
        .metric-box-val {
          font-size: 1.15rem;
          color: var(--text-primary);
        }
        .metric-box-uri {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--accent-secondary);
          word-break: break-all;
        }
        .db-uri-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .db-uri-input {
          font-family: var(--font-mono);
          font-size: 0.9rem;
        }
        .preset-buttons-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .preset-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .preset-btn {
          font-size: 0.75rem;
          padding: 4px 10px;
        }
        .db-feedback-box {
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: 0.88rem;
          line-height: 1.5;
        }
        .db-feedback-box.success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
        }
        .db-feedback-box.error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #f87171;
        }
        .db-actions-row {
          display: flex;
          gap: 12px;
          margin-top: 6px;
        }
        .collections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 10px;
        }
        .collection-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .col-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .col-icon {
          color: var(--accent-primary);
        }
        .col-name {
          font-family: var(--font-mono);
          font-size: 0.95rem;
        }
        .col-stats {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .col-count-num {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .col-count-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Notifications & Notes Layouts */
        .admin-notifications-layout, .admin-notes-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .notif-dispatch-card, .notif-log-card, .new-note-card, .notes-list-card {
          padding: 28px;
          border-radius: var(--radius-lg);
        }
        .card-top-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .card-top-header h3 {
          font-family: var(--font-display);
          font-size: 1.25rem;
          margin: 0;
        }
        .card-sub {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 4px 0 0;
        }
        .notif-form, .instructor-note-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .channel-select-row {
          display: flex;
          gap: 10px;
        }
        .channel-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: var(--radius-md);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .channel-pill.active {
          border-color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.15);
          color: var(--text-primary);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
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
        .form-input, .form-textarea {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          color: var(--text-primary);
          font-size: 0.9rem;
          outline: none;
        }
        .form-input:focus, .form-textarea:focus {
          border-color: var(--accent-primary);
        }
        .input-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .form-checkbox-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--text-secondary);
          cursor: pointer;
        }
        .notif-feedback-box {
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .notif-feedback-box.success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
        }
        .notif-feedback-box.error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #f87171;
        }
        .preview-inbox-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #38bdf8;
          font-weight: 600;
          text-decoration: underline;
        }
        .notif-summary-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
          max-width: 380px;
        }
        .notif-subject {
          font-weight: 600;
          font-size: 0.85rem;
        }
        .notif-preview-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .webmail-btn {
          font-size: 0.75rem;
          padding: 3px 8px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .instructor-notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
          margin-top: 10px;
        }
        .instructor-note-item {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 16px;
        }
        .item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .lesson-path-tag {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--accent-secondary);
        }
        .item-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .delete-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .delete-btn:hover {
          color: var(--accent-danger);
        }
        .empty-text {
          color: var(--text-muted);
          font-size: 0.9rem;
          text-align: center;
          padding: 24px 0;
        }

        /* Modal Styles */
        .modal-backdrop {
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
        .modal-window {
          max-width: 520px;
          width: 100%;
          border-radius: var(--radius-lg);
          padding: 28px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .modal-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .modal-title-row h3 {
          font-family: var(--font-display);
          font-size: 1.3rem;
          margin: 0;
        }
        .modal-icon {
          color: var(--accent-primary);
        }
        .modal-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .modal-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0 0 10px;
          line-height: 1.5;
        }
        .delete-warning-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          border-radius: var(--radius-md);
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #f87171;
          font-size: 0.85rem;
          line-height: 1.5;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 10px;
        }
        .modal-alert-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #f87171;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 0.85rem;
        }
        .modal-alert-success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 0.85rem;
        }
        @media (max-width: 900px) {
          .stats-detail-grid {
            grid-template-columns: 1fr;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Bookmark = require('../models/Bookmark');
const Note = require('../models/Note');
const LessonNote = require('../models/LessonNote');
const { listSubjects, loadLesson, buildSubjectTree } = require('../services/contentLoader');
const { getRecentNotifications, sendEmail, sendSms } = require('../services/notificationService');
const { getCurrentUri, testConnection, reconnect } = require('../config/db');

// Protect all admin routes
router.use(protect);
router.use(admin);

// @route   GET /api/admin/stats
// @desc    Get system-wide overview metrics and health
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalAdmins,
      totalCompletions,
      totalBookmarks,
      totalNotes,
      bookmarks,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      Progress.countDocuments(),
      Bookmark.countDocuments(),
      Note.countDocuments(),
      Bookmark.find(),
      User.find().sort({ createdAt: -1 }).limit(6).select('-password')
    ]);

    const subjects = listSubjects();
    let totalLessons = 0;
    for (const s of subjects) {
      const tree = buildSubjectTree(s.slug);
      if (tree && tree.sections) {
        for (const sec of tree.sections) {
          totalLessons += (sec.lessons || []).length;
        }
      }
    }

    // Calculate top bookmarked lessons
    const counts = {};
    for (const b of bookmarks) {
      counts[b.lessonPath] = (counts[b.lessonPath] || 0) + 1;
    }

    const topBookmarked = Object.entries(counts)
      .map(([lessonPath, count]) => {
        const [sub, les] = lessonPath.split('/');
        let title = lessonPath;
        try {
          const l = loadLesson(sub, les);
          title = l.title;
        } catch (e) {}
        return { lessonPath, count, title, subjectSlug: sub, lessonSlug: les };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalAdmins,
        totalCompletions,
        totalBookmarks,
        totalNotes,
        totalSubjects: subjects.length,
        totalLessons,
        topBookmarked,
        recentUsers,
        system: {
          nodeVersion: process.version,
          uptime: Math.floor(process.uptime()),
          platform: process.platform,
          memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
          dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting'
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get user list with filtering, phone search, sorting, and user learning progress
router.get('/users', async (req, res) => {
  try {
    const { q, role, status } = req.query;
    const filter = {};

    if (q && q.trim()) {
      filter.$or = [
        { name: new RegExp(q.trim(), 'i') },
        { email: new RegExp(q.trim(), 'i') },
        { phone: new RegExp(q.trim(), 'i') }
      ];
    }

    if (role && ['student', 'admin'].includes(role)) {
      filter.role = role;
    }

    if (status === 'active') {
      filter.isActive = true;
      filter.isBlocked = { $ne: true };
    } else if (status === 'blocked') {
      filter.$or = [{ isBlocked: true }, { isActive: false }];
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const [users, progressSummary] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }),
      Progress.aggregate([
        {
          $group: {
            _id: '$userId',
            completedCount: { $sum: 1 },
            lastCompletedAt: { $max: '$completedAt' }
          }
        }
      ])
    ]);

    const subjects = listSubjects();
    let totalLessons = 0;
    for (const s of subjects) {
      const tree = buildSubjectTree(s.slug);
      if (tree && tree.sections) {
        for (const sec of tree.sections) {
          totalLessons += (sec.lessons || []).length;
        }
      }
    }
    if (totalLessons === 0) totalLessons = 166;

    const progressMap = new Map();
    for (const p of progressSummary) {
      if (p._id) {
        progressMap.set(p._id.toString(), {
          completedCount: p.completedCount,
          lastCompletedAt: p.lastCompletedAt
        });
      }
    }

    const enrichedUsers = users.map(u => {
      const uObj = u.toObject();
      const prog = progressMap.get(u._id.toString()) || { completedCount: 0, lastCompletedAt: null };
      const percent = Math.min(100, Math.round((prog.completedCount / totalLessons) * 100));
      uObj.progress = {
        completedCount: prog.completedCount,
        totalLessons,
        percent,
        lastCompletedAt: prog.lastCompletedAt
      };
      return uObj;
    });

    res.json({ success: true, count: enrichedUsers.length, users: enrichedUsers, totalPlatformLessons: totalLessons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/users/:id/progress
// @desc    Get detailed curriculum progress breakdown for a specific user
router.get('/users/:id/progress', async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id).select('-password');
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const progressRecords = await Progress.find({ userId: targetUser._id }).sort({ completedAt: -1 });
    const completedPaths = new Set(progressRecords.map(p => p.lessonPath));

    const subjects = listSubjects();
    const subjectBreakdown = [];
    let totalPlatformLessons = 0;

    for (const subject of subjects) {
      const tree = buildSubjectTree(subject.slug);
      if (!tree) continue;

      const lessonPaths = [];
      for (const section of tree.sections || []) {
        for (const lesson of section.lessons || []) {
          lessonPaths.push(`${subject.slug}/${lesson.slug}`);
        }
      }

      totalPlatformLessons += lessonPaths.length;
      const completedInSubject = lessonPaths.filter(p => completedPaths.has(p)).length;
      const percent = lessonPaths.length > 0 ? Math.round((completedInSubject / lessonPaths.length) * 100) : 0;

      subjectBreakdown.push({
        slug: subject.slug,
        title: subject.title,
        icon: subject.icon,
        completed: completedInSubject,
        total: lessonPaths.length,
        percent
      });
    }

    if (totalPlatformLessons === 0) totalPlatformLessons = 166;
    const overallPercent = Math.min(100, Math.round((progressRecords.length / totalPlatformLessons) * 100));

    res.json({
      success: true,
      user: targetUser,
      progress: {
        completedCount: progressRecords.length,
        totalLessons: totalPlatformLessons,
        percent: overallPercent,
        subjectBreakdown,
        recentCompletions: progressRecords.slice(0, 10)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/users
// @desc    Admin manually creates a user
router.post('/users', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || (!email && !phone) || !password) {
      return res.status(400).json({ success: false, message: 'Name, password, and either email or phone are required' });
    }
    const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : undefined;
    const cleanPhone = phone && phone.trim() ? phone.trim() : undefined;

    if (cleanEmail) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) return res.status(400).json({ success: false, message: 'Email is already registered' });
    }
    if (cleanPhone) {
      const existing = await User.findOne({ phone: cleanPhone });
      if (existing) return res.status(400).json({ success: false, message: 'Phone number is already registered' });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password,
      role: role === 'admin' ? 'admin' : 'student',
      isActive: true
    });

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Admin deletes a user and cascades related student data
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own administrator account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await Promise.all([
      Progress.deleteMany({ userId: req.params.id }),
      Bookmark.deleteMany({ userId: req.params.id }),
      Note.deleteMany({ userId: req.params.id })
    ]);
    res.json({ success: true, message: `User "${user.name}" successfully deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/users/:id/reset-password
// @desc    Admin sets a new password for a user
router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: `Password for ${user.name} has been updated successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/notifications
// @desc    Get real-time log of dispatched emails and SMS notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = getRecentNotifications();
    res.json({ success: true, count: notifications.length, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/send-notification
// @desc    Manually dispatch custom notification (email or SMS)
router.post('/send-notification', async (req, res) => {
  try {
    const { channel, recipient, subject, message } = req.body;
    if (!channel || !recipient || !message) {
      return res.status(400).json({ success: false, message: 'Channel, recipient, and message are required' });
    }

    if (channel === 'email') {
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #0a0d14; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b; padding: 24px;">
          <h2 style="color: #6366f1; margin-top: 0; font-size: 18px;">⚡ DataDrix Administrator Message</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; white-space: pre-line;">${message}</p>
          <hr style="border: 0; border-top: 1px solid #1e293b; margin: 20px 0;" />
          <p style="color: #64748b; font-size: 12px; margin: 0;">Sent directly from DataDrix Admin Operations Hub.</p>
        </div>
      `;
      const result = await sendEmail({ to: recipient, subject: subject || 'Message from DataDrix Platform', html, text: message });
      return res.json({ success: true, result });
    } else if (channel === 'sms') {
      const result = await sendSms({ to: recipient, message });
      return res.json({ success: true, result });
    } else {
      return res.status(400).json({ success: false, message: 'Channel must be "email" or "sms"' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// @route   PUT /api/admin/users/:id
// @desc    Update user role, active status, or blocked status
router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { role, isActive, isBlocked, blockReason } = req.body;
    if (role && ['student', 'admin'].includes(role)) {
      user.role = role;
    }
    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }
    if (typeof isBlocked === 'boolean') {
      user.isBlocked = isBlocked;
      user.isActive = !isBlocked;
    }
    if (blockReason !== undefined) {
      user.blockReason = blockReason;
    }

    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/users/:id/block
// @desc    Block or unblock a user account
router.put('/users/:id/block', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot block your own administrator account' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { isBlocked, blockReason } = req.body;
    const newBlockedState = typeof isBlocked === 'boolean' ? isBlocked : !user.isBlocked;
    user.isBlocked = newBlockedState;
    user.isActive = !newBlockedState;
    if (blockReason !== undefined) {
      user.blockReason = blockReason;
    } else if (!newBlockedState) {
      user.blockReason = '';
    }

    await user.save();
    res.json({
      success: true,
      message: user.isBlocked
        ? `User "${user.name}" has been blocked.`
        : `User "${user.name}" has been unblocked.`,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/database/status
// @desc    Get MongoDB connection status, URI, latency, and collections
router.get('/database/status', async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    let collections = [];
    let pingMs = 0;

    if (isConnected && mongoose.connection.db) {
      const t0 = Date.now();
      try {
        await mongoose.connection.db.admin().ping();
        pingMs = Date.now() - t0;
      } catch (e) {
        pingMs = -1;
      }

      try {
        const list = await mongoose.connection.db.listCollections().toArray();
        for (const col of list) {
          const count = await mongoose.connection.db.collection(col.name).countDocuments().catch(() => 0);
          collections.push({
            name: col.name,
            count
          });
        }
      } catch (e) {
        console.warn('Error listing collections:', e.message);
      }
    }

    res.json({
      success: true,
      database: {
        connected: isConnected,
        state: isConnected ? 'connected' : mongoose.connection.readyState === 2 ? 'connecting' : 'disconnected',
        uri: getCurrentUri(),
        host: mongoose.connection.host || '127.0.0.1',
        port: mongoose.connection.port || 27017,
        name: mongoose.connection.name || 'datadrix',
        pingMs,
        collections
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/database/test-connection
// @desc    Test connection to a MongoDB URI before switching
router.post('/database/test-connection', async (req, res) => {
  try {
    const { uri } = req.body;
    if (!uri || !uri.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a MongoDB connection URI' });
    }
    const result = await testConnection(uri.trim());
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/database/reconnect
// @desc    Connect and switch to a different MongoDB URI
router.post('/database/reconnect', async (req, res) => {
  try {
    const { uri } = req.body;
    if (!uri || !uri.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a MongoDB connection URI' });
    }
    const result = await reconnect(uri.trim());
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/database/ping
// @desc    Ping connected MongoDB database
router.post('/database/ping', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
      return res.status(503).json({ success: false, message: 'Database is not currently connected' });
    }
    const t0 = Date.now();
    await mongoose.connection.db.admin().ping();
    const pingMs = Date.now() - t0;
    res.json({ success: true, pingMs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/admin/lesson-notes
// @desc    Get all official lesson notes
router.get('/lesson-notes', async (req, res) => {
  try {
    const notes = await LessonNote.find().populate('authorId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/admin/lesson-notes
// @desc    Create official lesson note
router.post('/lesson-notes', async (req, res) => {
  try {
    const { lessonPath, title, body, pinned, sortOrder, published } = req.body;

    if (!lessonPath || !title) {
      return res.status(400).json({ success: false, message: 'lessonPath and title are required' });
    }

    const note = await LessonNote.create({
      lessonPath,
      title: title.trim(),
      body: body || '',
      pinned: !!pinned,
      sortOrder: Number(sortOrder) || 0,
      published: published !== undefined ? !!published : true,
      authorId: req.user._id
    });

    res.status(201).json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/admin/lesson-notes/:id
// @desc    Update official lesson note
router.put('/lesson-notes/:id', async (req, res) => {
  try {
    const note = await LessonNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Lesson note not found' });
    }

    const { title, body, pinned, sortOrder, published } = req.body;
    if (title) note.title = title.trim();
    if (body !== undefined) note.body = body;
    if (pinned !== undefined) note.pinned = pinned;
    if (sortOrder !== undefined) note.sortOrder = Number(sortOrder);
    if (published !== undefined) note.published = published;

    await note.save();
    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/admin/lesson-notes/:id
// @desc    Delete official lesson note
router.delete('/lesson-notes/:id', async (req, res) => {
  try {
    const note = await LessonNote.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Lesson note not found' });
    }
    res.json({ success: true, message: 'Lesson note deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

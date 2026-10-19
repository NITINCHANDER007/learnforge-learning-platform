const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { protect } = require('../middleware/auth');
const Progress = require('../models/Progress');
const Bookmark = require('../models/Bookmark');
const Note = require('../models/Note');
const User = require('../models/User');
const {
  listSubjects,
  buildSubjectTree,
  loadLesson
} = require('../services/contentLoader');
const { getLessonNav } = require('../services/navEngine');

// Protect all dashboard routes
router.use(protect);

// Configure Multer for note attachments
const uploadDir = path.resolve(__dirname, '../../uploads/notes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper: Calculate streak
function calculateStreak(progressRecords) {
  if (!progressRecords || progressRecords.length === 0) return 0;

  const dateSet = new Set(
    progressRecords.map(p => new Date(p.completedAt).toISOString().split('T')[0])
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let current = todayStr;
  if (!dateSet.has(todayStr)) {
    if (dateSet.has(yesterdayStr)) {
      current = yesterdayStr;
    } else {
      return 0;
    }
  }

  let streak = 0;
  let checkDate = new Date(current);

  while (true) {
    const checkStr = checkDate.toISOString().split('T')[0];
    if (dateSet.has(checkStr)) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
}

// Helper: Subject Progress Chart
function getSubjectProgressChart(progressRecords) {
  const completedPaths = new Set(progressRecords.map(p => p.lessonPath));
  const subjects = listSubjects();
  const chart = [];

  for (const subject of subjects) {
    const tree = buildSubjectTree(subject.slug);
    if (!tree) continue;

    const lessonPaths = [];
    for (const section of tree.sections) {
      for (const lesson of section.lessons) {
        lessonPaths.push(`${subject.slug}/${lesson.slug}`);
      }
    }

    if (lessonPaths.length === 0) continue;

    const completedInSubject = lessonPaths.filter(p => completedPaths.has(p)).length;
    if (completedInSubject > 0) {
      chart.push({
        slug: subject.slug,
        title: subject.title,
        icon: subject.icon,
        completed: completedInSubject,
        total: lessonPaths.length,
        percent: Math.round((completedInSubject / lessonPaths.length) * 100)
      });
    }
  }

  return chart;
}

// Helper: Continue Learning suggestion
function getContinueLearning(lastProgress) {
  if (!lastProgress) return null;

  const [subjectSlug, lessonSlug] = lastProgress.lessonPath.split('/');
  const tree = buildSubjectTree(subjectSlug);
  if (!tree) return null;

  const nav = getLessonNav(tree, lessonSlug);
  if (!nav || !nav.next) return null;

  return {
    subjectSlug,
    lessonSlug: nav.next.slug,
    title: nav.next.title,
    subjectTitle: tree.title
  };
}

// @route   GET /api/dashboard/stats
// @desc    Get dashboard metrics, streak, progress chart, and recent activity
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    const [progressRecords, bookmarks, notes] = await Promise.all([
      Progress.find({ userId }).sort({ completedAt: -1 }),
      Bookmark.find({ userId }).sort({ createdAt: -1 }),
      Note.find({ userId }).sort({ createdAt: -1 })
    ]);

    const streak = calculateStreak(progressRecords);
    const progressChart = getSubjectProgressChart(progressRecords);
    const continueLearning = getContinueLearning(progressRecords[0]);

    // Build recent activity feed
    const events = [];
    for (const p of progressRecords.slice(0, 6)) {
      events.push({ type: 'completed', at: p.completedAt, lessonPath: p.lessonPath });
    }
    for (const b of bookmarks.slice(0, 6)) {
      events.push({ type: 'bookmarked', at: b.createdAt, lessonPath: b.lessonPath });
    }
    for (const n of notes.slice(0, 6)) {
      events.push({ type: 'note', at: n.createdAt, title: n.title });
    }

    events.sort((a, b) => new Date(b.at) - new Date(a.at));
    const recentActivity = events.slice(0, 6).map(event => {
      if (event.lessonPath) {
        const [sub, les] = event.lessonPath.split('/');
        try {
          const l = loadLesson(sub, les);
          return { ...event, title: l.title, subjectSlug: sub, lessonSlug: les };
        } catch (e) {
          return { ...event, title: event.lessonPath, subjectSlug: sub, lessonSlug: les };
        }
      }
      return event;
    });

    // Calculate total platform lessons and overall completion percentage
    const subjects = listSubjects();
    let totalPlatformLessons = 0;
    for (const s of subjects) {
      const tree = buildSubjectTree(s.slug);
      if (tree && tree.sections) {
        for (const sec of tree.sections) {
          totalPlatformLessons += (sec.lessons || []).length;
        }
      }
    }
    if (totalPlatformLessons === 0) totalPlatformLessons = 166;
    const overallPercent = Math.min(100, Math.round((progressRecords.length / totalPlatformLessons) * 100));

    res.json({
      success: true,
      stats: {
        completedCount: progressRecords.length,
        totalLessons: totalPlatformLessons,
        overallPercent,
        bookmarkCount: bookmarks.length,
        noteCount: notes.length,
        streak,
        progressChart,
        continueLearning,
        recentActivity
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/dashboard/bookmarks
// @desc    Get all bookmarked lessons
router.get('/bookmarks', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const resolved = [];

    for (const b of bookmarks) {
      const [subjectSlug, lessonSlug] = b.lessonPath.split('/');
      try {
        const lesson = loadLesson(subjectSlug, lessonSlug);
        resolved.push({
          id: b._id,
          path: b.lessonPath,
          subjectSlug,
          lessonSlug,
          title: lesson.title,
          createdAt: b.createdAt
        });
      } catch (e) {
        // Skip orphaned lessons gracefully
      }
    }

    res.json({ success: true, bookmarks: resolved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/dashboard/bookmarks/toggle
// @desc    Toggle bookmark for a lesson
router.post('/bookmarks/toggle', async (req, res) => {
  try {
    const { subjectSlug, lessonSlug } = req.body;
    if (!subjectSlug || !lessonSlug) {
      return res.status(400).json({ success: false, message: 'subjectSlug and lessonSlug required' });
    }

    const lessonPath = `${subjectSlug}/${lessonSlug}`;
    const existing = await Bookmark.findOne({ userId: req.user._id, lessonPath });

    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return res.json({ success: true, bookmarked: false, message: 'Bookmark removed.' });
    } else {
      await Bookmark.create({ userId: req.user._id, lessonPath });
      return res.json({ success: true, bookmarked: true, message: 'Lesson bookmarked.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/dashboard/progress/toggle
// @desc    Toggle progress (mark complete / unmark)
router.post('/progress/toggle', async (req, res) => {
  try {
    const { subjectSlug, lessonSlug } = req.body;
    if (!subjectSlug || !lessonSlug) {
      return res.status(400).json({ success: false, message: 'subjectSlug and lessonSlug required' });
    }

    const lessonPath = `${subjectSlug}/${lessonSlug}`;
    const existing = await Progress.findOne({ userId: req.user._id, lessonPath });

    if (existing) {
      await Progress.deleteOne({ _id: existing._id });
      return res.json({ success: true, completed: false, message: 'Marked as not completed.' });
    } else {
      await Progress.create({ userId: req.user._id, lessonPath });
      return res.json({ success: true, completed: true, message: 'Marked as completed! Great job!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/dashboard/notes
// @desc    Get user's personal notes
router.get('/notes', async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/dashboard/notes
// @desc    Create new personal note
router.post('/notes', upload.single('attachment'), async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const attachmentPath = req.file ? `/uploads/notes/${req.file.filename}` : null;

    const note = await Note.create({
      userId: req.user._id,
      title: title.trim(),
      body: body || '',
      attachmentPath
    });

    res.status(201).json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/dashboard/notes/:id
// @desc    Update a personal note
router.put('/notes/:id', upload.single('attachment'), async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const { title, body } = req.body;
    if (title) note.title = title.trim();
    if (body !== undefined) note.body = body;
    if (req.file) {
      note.attachmentPath = `/uploads/notes/${req.file.filename}`;
    }

    await note.save();
    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/dashboard/notes/:id
// @desc    Delete a personal note
router.delete('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.json({ success: true, message: 'Note deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/dashboard/profile
// @desc    Update name & email
router.put('/profile', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const existing = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use.' });
      }
      user.email = cleanEmail;
    }

    await user.save();
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/dashboard/password
// @desc    Change password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/dashboard/export
// @desc    Export student's data backup
router.get('/export', async (req, res) => {
  try {
    const [notes, bookmarks, progress] = await Promise.all([
      Note.find({ userId: req.user._id }),
      Bookmark.find({ userId: req.user._id }),
      Progress.find({ userId: req.user._id })
    ]);

    const payload = {
      version: '1.0',
      platform: 'DataDrix MERN',
      exportedAt: new Date().toISOString(),
      user: {
        name: req.user.name,
        email: req.user.email
      },
      notes: notes.map(n => ({ title: n.title, body: n.body, createdAt: n.createdAt })),
      bookmarks: bookmarks.map(b => b.lessonPath),
      progress: progress.map(p => ({ lessonPath: p.lessonPath, completedAt: p.completedAt }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=datadrix-backup-${req.user._id}.json`);
    res.send(JSON.stringify(payload, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/dashboard/import
// @desc    Restore student's data from JSON backup
router.post('/import', async (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    }

    let importedNotes = 0;
    let importedBookmarks = 0;
    let importedProgress = 0;

    // 1. Notes
    if (Array.isArray(data.notes)) {
      for (const n of data.notes) {
        if (n && n.title) {
          const existing = await Note.findOne({ userId: req.user._id, title: n.title.trim() });
          if (!existing) {
            await Note.create({
              userId: req.user._id,
              title: n.title.trim(),
              body: n.body || ''
            });
            importedNotes++;
          }
        }
      }
    }

    // 2. Bookmarks
    if (Array.isArray(data.bookmarks)) {
      for (const path of data.bookmarks) {
        if (path) {
          const existing = await Bookmark.findOne({ userId: req.user._id, lessonPath: path });
          if (!existing) {
            await Bookmark.create({ userId: req.user._id, lessonPath: path });
            importedBookmarks++;
          }
        }
      }
    }

    // 3. Progress
    if (Array.isArray(data.progress)) {
      for (const p of data.progress) {
        const path = typeof p === 'string' ? p : p.lessonPath;
        if (path) {
          const existing = await Progress.findOne({ userId: req.user._id, lessonPath: path });
          if (!existing) {
            await Progress.create({ userId: req.user._id, lessonPath: path });
            importedProgress++;
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Restored ${importedNotes} notes, ${importedBookmarks} bookmarks, and ${importedProgress} completed lessons!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/dashboard/certificate/:subjectSlug
// @desc    Generate verifiable completion certificate
router.get('/certificate/:subjectSlug', async (req, res) => {
  try {
    const { subjectSlug } = req.params;
    const tree = buildSubjectTree(subjectSlug);
    if (!tree) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    let totalLessons = 0;
    for (const sec of tree.sections) {
      totalLessons += (sec.lessons || []).length;
    }

    const completed = await Progress.find({
      userId: req.user._id,
      lessonPath: new RegExp(`^${subjectSlug}/`)
    });

    const completedCount = completed.length;
    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    const certHash = crypto
      .createHash('sha256')
      .update(`${req.user._id}-${subjectSlug}-datadrix`)
      .digest('hex')
      .substring(0, 8)
      .toUpperCase();

    const certId = `DDX-${subjectSlug.toUpperCase().substring(0, 4)}-${certHash}`;

    res.json({
      success: true,
      certificate: {
        certId,
        userName: req.user.name,
        subjectTitle: tree.title,
        subjectSlug,
        totalLessons,
        completedCount,
        percentage,
        isCompleted: percentage === 100,
        issueDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

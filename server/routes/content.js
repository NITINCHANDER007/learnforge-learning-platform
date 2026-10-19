const express = require('express');
const router = express.Router();
const {
  listSubjects,
  buildSubjectTree,
  getFirstLessonSlug,
  loadLesson,
  searchLessons
} = require('../services/contentLoader');
const { getLessonNav } = require('../services/navEngine');
const Bookmark = require('../models/Bookmark');
const Progress = require('../models/Progress');
const LessonNote = require('../models/LessonNote');
const { optionalAuth } = require('../middleware/auth');

// @route   GET /api/content/subjects
// @desc    Get all available subjects with lesson counts
// @access  Public
router.get('/subjects', (req, res) => {
  try {
    const subjects = listSubjects();
    const enriched = subjects.map(s => {
      const tree = buildSubjectTree(s.slug);
      let lessonCount = 0;
      if (tree && tree.sections) {
        for (const sec of tree.sections) {
          lessonCount += (sec.lessons || []).length;
        }
      }
      return {
        ...s,
        lessonCount
      };
    });

    res.json({
      success: true,
      subjects: enriched,
      totalSubjects: enriched.length,
      totalLessons: enriched.reduce((acc, s) => acc + s.lessonCount, 0)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/content/subjects/:subjectSlug
// @desc    Get complete tree (sections + lessons) for a specific subject
// @access  Public
router.get('/subjects/:subjectSlug', (req, res) => {
  try {
    const tree = buildSubjectTree(req.params.subjectSlug);
    if (!tree) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, tree });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/content/subjects/:subjectSlug/first
// @desc    Get the first lesson slug for a subject
// @access  Public
router.get('/subjects/:subjectSlug/first', (req, res) => {
  try {
    const firstSlug = getFirstLessonSlug(req.params.subjectSlug);
    if (!firstSlug) {
      return res.status(404).json({ success: false, message: 'No lessons found in this subject' });
    }
    res.json({ success: true, firstLessonSlug: firstSlug });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/content/subjects/:subjectSlug/lessons/:lessonSlug
// @desc    Get a single lesson with rendered HTML, subject tree, navigation, and user status
// @access  Public (optional auth for user-specific bookmark/progress)
router.get('/subjects/:subjectSlug/lessons/:lessonSlug', optionalAuth, async (req, res) => {
  try {
    const { subjectSlug, lessonSlug } = req.params;
    let lesson;
    try {
      lesson = loadLesson(subjectSlug, lessonSlug);
    } catch (e) {
      return res.status(404).json({ success: false, message: e.message });
    }

    const subjectTree = buildSubjectTree(subjectSlug);
    const nav = getLessonNav(subjectTree, lessonSlug);

    let isBookmarked = false;
    let isCompleted = false;
    let completedLessonSlugs = [];

    if (req.user) {
      const lessonPath = `${subjectSlug}/${lessonSlug}`;
      const [bm, prog, allProgress] = await Promise.all([
        Bookmark.findOne({ userId: req.user._id, lessonPath }),
        Progress.findOne({ userId: req.user._id, lessonPath }),
        Progress.find({
          userId: req.user._id,
          lessonPath: new RegExp(`^${subjectSlug}/`)
        })
      ]);

      isBookmarked = !!bm;
      isCompleted = !!prog;
      completedLessonSlugs = allProgress.map(p => p.lessonPath.split('/')[1]);
    }

    // Official admin notes for this lesson
    const lessonPath = `${subjectSlug}/${lessonSlug}`;
    const officialNotes = await LessonNote.find({
      lessonPath,
      published: true
    }).sort({ pinned: -1, sortOrder: 1, createdAt: 1 });

    res.json({
      success: true,
      lesson,
      subjectTree,
      nav,
      isBookmarked,
      isCompleted,
      completedLessonSlugs,
      officialNotes
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/content/search
// @desc    Search all lessons across all subjects
// @access  Public
router.get('/search', (req, res) => {
  try {
    const q = req.query.q || '';
    const results = searchLessons(q);
    res.json({ success: true, count: results.length, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

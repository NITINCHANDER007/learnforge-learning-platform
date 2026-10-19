const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const SeoSettings = require('../models/SeoSettings');
const { protect, admin } = require('../middleware/auth');
const {
  generateUniqueBlogPost,
  checkContentUniqueness,
  getAvailableBacklinkTargets,
  SUBJECT_METADATA
} = require('../services/seoGeneratorService');
const {
  publishPostToPlatforms,
  testWordPressConnection,
  testMediumConnection,
  testGoogleSitesConnection,
  testGeminiConnection
} = require('../services/publisherService');
const {
  runAutoPilotCycle,
  initializeAutoPilotScheduler,
  GOOGLE_APPS_SCRIPT_TEMPLATE
} = require('../services/autoPilotService');
const { Marked } = require('marked');
const marked = new Marked({ gfm: true, breaks: true });

// Require admin authentication for all SEO Backlink operations
router.use(protect, admin);

/**
 * @route   GET /api/seo/stats
 * @desc    Aggregate SEO backlink metrics, publication counts, and scheduler health
 */
router.get('/stats', async (req, res) => {
  try {
    const totalPosts = await BlogPost.countDocuments();
    const publishedCount = await BlogPost.countDocuments({ status: 'published' });
    const draftCount = await BlogPost.countDocuments({ status: 'draft' });
    const failedCount = await BlogPost.countDocuments({ status: 'failed' });

    // Platform breakdown
    const wpCount = await BlogPost.countDocuments({ 'platformPublications.wordpress.status': 'published' });
    const medCount = await BlogPost.countDocuments({ 'platformPublications.medium.status': 'published' });
    const gsCount = await BlogPost.countDocuments({ 'platformPublications.googleSites.status': 'published' });

    // Aggregate backlinks count and average uniqueness
    const agg = await BlogPost.aggregate([
      {
        $project: {
          backlinksCount: { $size: { $ifNull: ['$backlinks', []] } },
          uniquenessScore: { $ifNull: ['$uniquenessScore', 100] }
        }
      },
      {
        $group: {
          _id: null,
          totalBacklinks: { $sum: '$backlinksCount' },
          avgUniqueness: { $avg: '$uniquenessScore' }
        }
      }
    ]);

    const totalBacklinks = agg[0]?.totalBacklinks || 0;
    const avgUniqueness = Math.round((agg[0]?.avgUniqueness || 100) * 10) / 10;

    const settings = await SeoSettings.getSettings();

    res.json({
      success: true,
      stats: {
        totalPosts,
        publishedCount,
        draftCount,
        failedCount,
        totalBacklinks,
        avgUniqueness,
        platforms: {
          wordpress: wpCount,
          medium: medCount,
          googleSites: gsCount
        },
        autoPilot: {
          enabled: settings.autoPilot.enabled,
          intervalHours: settings.autoPilot.intervalHours,
          lastRunAt: settings.autoPilot.lastRunAt,
          nextRunAt: settings.autoPilot.nextRunAt,
          lastStatus: settings.autoPilot.lastStatus
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/seo/posts
 * @desc    Get paginated/filtered list of blog posts
 */
router.get('/posts', async (req, res) => {
  try {
    const { status, subject, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      if (status === 'published') {
        query.status = 'published';
      } else if (status === 'draft') {
        query.status = 'draft';
      } else if (status === 'wordpress') {
        query['platformPublications.wordpress.status'] = 'published';
      } else if (status === 'medium') {
        query['platformPublications.medium.status'] = 'published';
      } else if (status === 'googleSites') {
        query['platformPublications.googleSites.status'] = 'published';
      } else {
        query.status = status;
      }
    }

    if (subject && subject !== 'all') {
      query.targetSubject = subject;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { metaDescription: { $regex: search, $options: 'i' } },
        { targetKeywords: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await BlogPost.countDocuments(query);
    const posts = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/seo/posts/:id
 * @desc    Get single blog post by ID
 */
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   POST /api/seo/posts/generate
 * @desc    Generate a new unique SEO blog post (preview or instant save)
 */
router.post('/posts/generate', async (req, res) => {
  try {
    const { subject, saveImmediately = true, forceProvider, geminiApiKey, websiteBaseUrl } = req.body;

    if (!subject) {
      return res.status(400).json({ success: false, message: 'Please specify a target subject.' });
    }

    const generated = await generateUniqueBlogPost(subject, {
      forceProvider,
      geminiApiKey,
      websiteBaseUrl
    });

    let savedPost = null;
    if (saveImmediately) {
      savedPost = await BlogPost.create({
        title: generated.title,
        slug: generated.slug,
        metaDescription: generated.metaDescription,
        targetKeywords: generated.targetKeywords,
        secondaryKeywords: generated.secondaryKeywords,
        targetSubject: generated.targetSubject,
        topicAngle: generated.topicAngle,
        contentMarkdown: generated.contentMarkdown,
        contentHtml: generated.contentHtml,
        wordCount: generated.wordCount,
        readingTimeMinutes: generated.readingTimeMinutes,
        backlinks: generated.backlinks,
        uniquenessScore: generated.uniquenessScore,
        contentHash: generated.contentHash,
        status: 'draft',
        canonicalUrl: generated.canonicalUrl,
        generationSource: generated.generationSource,
        createdBy: req.user._id
      });
    }

    res.json({
      success: true,
      generated,
      post: savedPost,
      message: savedPost
        ? `Generated and saved unique draft: "${savedPost.title}" (${savedPost.uniquenessScore}% unique)`
        : 'Generated blog article preview successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   POST /api/seo/posts
 * @desc    Create manual blog post
 */
router.post('/posts', async (req, res) => {
  try {
    const { title, contentMarkdown, metaDescription, targetSubject, targetKeywords, backlinks, canonicalUrl } = req.body;

    if (!title || !contentMarkdown || !targetSubject) {
      return res.status(400).json({ success: false, message: 'Title, markdown content, and target subject are required.' });
    }

    const uniqueness = await checkContentUniqueness(contentMarkdown);
    const contentHtml = marked.parse(contentMarkdown);
    const wordCount = contentMarkdown.split(/\s+/).filter(Boolean).length;
    const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}-${Date.now().toString(36).slice(-4)}`;

    const post = await BlogPost.create({
      title,
      slug,
      metaDescription: metaDescription || title.slice(0, 160),
      targetKeywords: targetKeywords || [],
      targetSubject,
      contentMarkdown,
      contentHtml,
      wordCount,
      readingTimeMinutes,
      backlinks: backlinks || [],
      uniquenessScore: uniqueness.uniquenessScore,
      contentHash: uniqueness.hash,
      status: 'draft',
      canonicalUrl,
      generationSource: 'manual',
      createdBy: req.user._id
    });

    res.json({ success: true, post, message: 'Blog post created as draft.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   PUT /api/seo/posts/:id
 * @desc    Update existing blog post
 */
router.put('/posts/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found.' });
    }

    const { title, contentMarkdown, metaDescription, targetSubject, targetKeywords, backlinks, canonicalUrl, status } = req.body;

    if (title) post.title = title;
    if (metaDescription) post.metaDescription = metaDescription;
    if (targetSubject) post.targetSubject = targetSubject;
    if (targetKeywords) post.targetKeywords = targetKeywords;
    if (backlinks) post.backlinks = backlinks;
    if (canonicalUrl) post.canonicalUrl = canonicalUrl;
    if (status) post.status = status;

    if (contentMarkdown && contentMarkdown !== post.contentMarkdown) {
      post.contentMarkdown = contentMarkdown;
      post.contentHtml = marked.parse(contentMarkdown);
      post.wordCount = contentMarkdown.split(/\s+/).filter(Boolean).length;
      post.readingTimeMinutes = Math.max(1, Math.round(post.wordCount / 200));

      const uniqueness = await checkContentUniqueness(contentMarkdown, post._id);
      post.uniquenessScore = uniqueness.uniquenessScore;
      post.contentHash = uniqueness.hash;
    }

    await post.save();
    res.json({ success: true, post, message: 'Blog post updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   DELETE /api/seo/posts/:id
 * @desc    Delete a blog post
 */
router.delete('/posts/:id', async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found.' });
    }
    res.json({ success: true, message: `Deleted blog post "${post.title}"` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   POST /api/seo/posts/:id/publish
 * @desc    Publish blog post to Google Sites, WordPress, and/or Medium
 */
router.post('/posts/:id/publish', async (req, res) => {
  try {
    const { platforms = [], dryRun = false } = req.body;
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found.' });
    }

    const result = await publishPostToPlatforms(post._id, platforms, { dryRun });

    res.json({
      success: result.success,
      post: result.post,
      results: result.results,
      message: result.success
        ? 'Publishing completed successfully!'
        : 'One or more publishing targets encountered errors.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   POST /api/seo/posts/:id/check-uniqueness
 * @desc    Re-check uniqueness score against other posts in database
 */
router.post('/posts/:id/check-uniqueness', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found.' });
    }

    const result = await checkContentUniqueness(post.contentMarkdown, post._id);
    post.uniquenessScore = result.uniquenessScore;
    await post.save();

    res.json({
      success: true,
      result,
      uniquenessScore: result.uniquenessScore
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/seo/settings
 * @desc    Get SEO, platform credentials (masked), and autopilot settings
 */
router.get('/settings', async (req, res) => {
  try {
    const settings = await SeoSettings.getSettings();

    // Mask sensitive tokens/passwords for UI security
    const masked = settings.toObject();
    if (masked.wordpress?.applicationPassword) {
      masked.wordpress.applicationPasswordMasked = '••••••••••••••••';
      masked.wordpress.hasPassword = true;
    }
    if (masked.medium?.integrationToken) {
      masked.medium.integrationTokenMasked = `${masked.medium.integrationToken.slice(0, 4)}••••••••${masked.medium.integrationToken.slice(-4)}`;
      masked.medium.hasToken = true;
    }
    if (masked.aiEngine?.geminiApiKey) {
      masked.aiEngine.geminiApiKeyMasked = `${masked.aiEngine.geminiApiKey.slice(0, 4)}••••••••${masked.aiEngine.geminiApiKey.slice(-4)}`;
      masked.aiEngine.hasApiKey = true;
    }

    res.json({ success: true, settings: masked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   PUT /api/seo/settings
 * @desc    Update SEO, platform credentials, and autopilot settings
 */
router.put('/settings', async (req, res) => {
  try {
    const settings = await SeoSettings.getSettings();
    const { websiteBaseUrl, websiteName, autoPilot, wordpress, medium, googleSites, aiEngine, antiDuplication } = req.body;

    if (websiteBaseUrl !== undefined) settings.websiteBaseUrl = websiteBaseUrl;
    if (websiteName !== undefined) settings.websiteName = websiteName;

    // WordPress
    if (wordpress) {
      if (wordpress.enabled !== undefined) settings.wordpress.enabled = wordpress.enabled;
      if (wordpress.siteUrl !== undefined) settings.wordpress.siteUrl = wordpress.siteUrl;
      if (wordpress.username !== undefined) settings.wordpress.username = wordpress.username;
      if (wordpress.applicationPassword) settings.wordpress.applicationPassword = wordpress.applicationPassword;
      if (wordpress.defaultStatus !== undefined) settings.wordpress.defaultStatus = wordpress.defaultStatus;
    }

    // Medium
    if (medium) {
      if (medium.enabled !== undefined) settings.medium.enabled = medium.enabled;
      if (medium.integrationToken) settings.medium.integrationToken = medium.integrationToken;
      if (medium.authorId !== undefined) settings.medium.authorId = medium.authorId;
      if (medium.defaultStatus !== undefined) settings.medium.defaultStatus = medium.defaultStatus;
      if (medium.notifyFollowers !== undefined) settings.medium.notifyFollowers = medium.notifyFollowers;
    }

    // Google Sites
    if (googleSites) {
      if (googleSites.enabled !== undefined) settings.googleSites.enabled = googleSites.enabled;
      if (googleSites.webhookUrl !== undefined) settings.googleSites.webhookUrl = googleSites.webhookUrl;
      if (googleSites.siteUrl !== undefined) settings.googleSites.siteUrl = googleSites.siteUrl;
      if (googleSites.secretToken !== undefined) settings.googleSites.secretToken = googleSites.secretToken;
      if (googleSites.method !== undefined) settings.googleSites.method = googleSites.method;
    }

    // AI Engine
    if (aiEngine) {
      if (aiEngine.provider !== undefined) settings.aiEngine.provider = aiEngine.provider;
      if (aiEngine.geminiApiKey) settings.aiEngine.geminiApiKey = aiEngine.geminiApiKey;
      if (aiEngine.modelName !== undefined) settings.aiEngine.modelName = aiEngine.modelName;
    }

    // Anti Duplication
    if (antiDuplication) {
      if (antiDuplication.similarityThresholdPercent !== undefined) {
        settings.antiDuplication.similarityThresholdPercent = antiDuplication.similarityThresholdPercent;
      }
      if (antiDuplication.enforceCanonical !== undefined) {
        settings.antiDuplication.enforceCanonical = antiDuplication.enforceCanonical;
      }
    }

    // AutoPilot Scheduler
    if (autoPilot) {
      if (autoPilot.enabled !== undefined) settings.autoPilot.enabled = autoPilot.enabled;
      if (autoPilot.intervalHours !== undefined) settings.autoPilot.intervalHours = autoPilot.intervalHours;
      if (autoPilot.cronSchedule !== undefined) settings.autoPilot.cronSchedule = autoPilot.cronSchedule;
      if (autoPilot.autoPublish !== undefined) settings.autoPilot.autoPublish = autoPilot.autoPublish;
      if (autoPilot.platforms !== undefined) settings.autoPilot.platforms = autoPilot.platforms;
      if (autoPilot.targetSubjects !== undefined) settings.autoPilot.targetSubjects = autoPilot.targetSubjects;
    }

    await settings.save();

    // Re-initialize cron scheduler to adopt new settings immediately
    await initializeAutoPilotScheduler();

    res.json({ success: true, message: 'SEO configuration saved and scheduler updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   POST /api/seo/settings/test-connection/:platform
 * @desc    Test connection for a specific platform
 */
router.post('/settings/test-connection/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const credentials = req.body || {};
    const settings = await SeoSettings.getSettings();

    let result;
    if (platform === 'wordpress') {
      result = await testWordPressConnection(credentials);
      settings.wordpress.connectionStatus = 'connected';
      settings.wordpress.lastConnectedAt = new Date();
      settings.wordpress.lastError = null;
    } else if (platform === 'medium') {
      result = await testMediumConnection(credentials);
      settings.medium.connectionStatus = 'connected';
      settings.medium.lastConnectedAt = new Date();
      settings.medium.lastError = null;
      if (result.authorId) {
        settings.medium.authorId = result.authorId;
        settings.medium.username = result.username;
      }
    } else if (platform === 'googleSites') {
      result = await testGoogleSitesConnection(credentials);
      settings.googleSites.connectionStatus = 'connected';
      settings.googleSites.lastConnectedAt = new Date();
      settings.googleSites.lastError = null;
    } else if (platform === 'gemini') {
      const apiKey = credentials.geminiApiKey || settings.aiEngine?.geminiApiKey;
      const model = credentials.modelName || settings.aiEngine?.modelName || 'gemini-1.5-flash';
      result = await testGeminiConnection(apiKey, model);
      settings.aiEngine.connectionStatus = 'connected';
      settings.aiEngine.lastError = null;
    } else {
      return res.status(400).json({ success: false, message: `Unknown platform: ${platform}` });
    }

    await settings.save();
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * @route   POST /api/seo/autopilot/trigger
 * @desc    Manually execute a single cycle of the Auto-Pilot
 */
router.post('/autopilot/trigger', async (req, res) => {
  try {
    const result = await runAutoPilotCycle('manual_dashboard_trigger');
    res.json({
      success: result.success,
      result,
      message: result.success
        ? `Auto-Pilot executed: generated "${result.post?.title}" (${result.published ? 'Published' : 'Saved as Draft'})`
        : `Auto-Pilot cycle failed: ${result.error}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/seo/subjects-and-lessons
 * @desc    Get website subjects and real lesson links for targeted contextual backlink generation
 */
router.get('/subjects-and-lessons', async (req, res) => {
  try {
    const settings = await SeoSettings.getSettings();
    const targets = getAvailableBacklinkTargets(settings.websiteBaseUrl);
    const subjects = Object.keys(SUBJECT_METADATA).map(slug => ({
      slug,
      name: SUBJECT_METADATA[slug].name,
      category: SUBJECT_METADATA[slug].category,
      keywords: SUBJECT_METADATA[slug].keywords
    }));

    res.json({
      success: true,
      subjects,
      targets
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/seo/google-apps-script-code
 * @desc    Get ready-to-copy Google Apps Script code for Google Sites integration
 */
router.get('/google-apps-script-code', (req, res) => {
  res.json({
    success: true,
    code: GOOGLE_APPS_SCRIPT_TEMPLATE
  });
});

module.exports = router;

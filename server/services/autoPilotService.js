const cron = require('node-cron');
const SeoSettings = require('../models/SeoSettings');
const BlogPost = require('../models/BlogPost');
const { generateUniqueBlogPost } = require('./seoGeneratorService');
const { publishPostToPlatforms } = require('./publisherService');
const { listSubjects } = require('./contentLoader');

let currentCronJob = null;
let isCycleRunning = false;

/**
 * Complete Google Apps Script template for Google Sites integration
 * (Provided to users to paste into Google Apps Script -> Deploy as Web App)
 */
const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * Google Apps Script for Automated DataDrix SEO Backlink Blog Publishing to Google Sites
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Drive (drive.google.com) and create a new Google Apps Script project.
 * 2. Replace all contents of Code.gs with this script.
 * 3. Set your SECRET_TOKEN below (must match your DataDrix SEO Settings).
 * 4. Click "Deploy" > "New deployment".
 * 5. Select type: "Web app".
 * 6. Execute as: "Me" (your Google account).
 * 7. Who has access: "Anyone".
 * 8. Copy the Web App URL and paste it into DataDrix SEO Settings > Google Sites Webhook URL!
 */

const SECRET_TOKEN = "datadrix-sites-secret-key-2026";
// Optional: Google Drive folder ID where blog docs will be stored (leave empty for Root)
const BLOG_FOLDER_ID = "";

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    
    // Security verification
    if (postData.secretToken !== SECRET_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: "Invalid secret token."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Ping check
    if (postData.action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Google Apps Script webhook is active and connected!"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const title = postData.title || "Untitled SEO Article";
    const content = postData.contentHtml || postData.contentMarkdown || "";
    const canonicalUrl = postData.canonicalUrl || "";
    
    // Create formatted Google Doc for this blog article
    const doc = DocumentApp.create(title);
    const body = doc.getBody();
    
    body.appendParagraph(title).setHeading(DocumentApp.ParagraphHeading.TITLE);
    
    if (canonicalUrl) {
      const canonPara = body.appendParagraph("Original Source: " + canonicalUrl);
      canonPara.setLinkUrl(canonicalUrl);
    }
    
    body.appendParagraph("Published via DataDrix Automated SEO Backlink Publisher: " + new Date().toLocaleString());
    body.appendHorizontalRule();
    
    // Add plain text or structured sections
    const cleanContent = content.replace(/<[^>]*>?/gm, "\\n");
    body.appendParagraph(cleanContent);
    
    doc.saveAndClose();
    
    const file = DriveApp.getFileById(doc.getId());
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    if (BLOG_FOLDER_ID) {
      const folder = DriveApp.getFolderById(BLOG_FOLDER_ID);
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      pageId: doc.getId(),
      pageUrl: doc.getUrl(),
      message: "Published to Google Drive / Google Sites Document successfully."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    service: "DataDrix Google Sites SEO Webhook",
    status: "online",
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
`;

/**
 * Execute a single cycle of the Auto-Pilot:
 * 1. Pick target subject
 * 2. Generate unique SEO blog
 * 3. Save as BlogPost
 * 4. Publish if autoPublish is true
 * 5. Log activity
 */
async function runAutoPilotCycle(triggerSource = 'scheduled') {
  if (isCycleRunning) {
    console.log('[SEO AutoPilot] Cycle is already in progress, skipping overlapping invocation.');
    return { skipped: true, reason: 'Already running' };
  }

  isCycleRunning = true;
  const settings = await SeoSettings.getSettings();

  try {
    console.log(`[SEO AutoPilot] Starting automated cycle (Trigger: ${triggerSource})...`);
    settings.autoPilot.lastStatus = 'running';
    await settings.save();

    // 1. Determine subject
    const allAvailable = listSubjects().map(s => s.slug);
    const configuredSubjects = settings.autoPilot.targetSubjects && settings.autoPilot.targetSubjects.length > 0
      ? settings.autoPilot.targetSubjects
      : allAvailable;

    const subjectsPool = configuredSubjects.length > 0 ? configuredSubjects : ['python', 'sql', 'machine-learning', 'pandas'];

    // Find subject with lowest recent blog count for balanced topical backlink profile
    const counts = await BlogPost.aggregate([
      { $match: { targetSubject: { $in: subjectsPool } } },
      { $group: { _id: '$targetSubject', count: { $sum: 1 } } }
    ]);
    const countsMap = {};
    for (const c of counts) countsMap[c._id] = c.count;

    let chosenSubject = subjectsPool[0];
    let minCount = Infinity;
    for (const subj of subjectsPool) {
      const c = countsMap[subj] || 0;
      if (c < minCount) {
        minCount = c;
        chosenSubject = subj;
      }
    }

    console.log(`[SEO AutoPilot] Selected target subject: ${chosenSubject} (Existing articles: ${minCount})`);

    // 2. Generate unique blog post
    const generated = await generateUniqueBlogPost(chosenSubject, {
      websiteBaseUrl: settings.websiteBaseUrl
    });

    // 3. Save post to database
    const newPost = await BlogPost.create({
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
      generationSource: generated.generationSource
    });

    console.log(`[SEO AutoPilot] Generated article: "${newPost.title}" (Uniqueness: ${newPost.uniquenessScore}%)`);

    // 4. Auto-publish if enabled
    let publishResults = null;
    const platformsToPublish = [];
    if (settings.autoPilot.platforms?.wordpress) platformsToPublish.push('wordpress');
    if (settings.autoPilot.platforms?.medium) platformsToPublish.push('medium');
    if (settings.autoPilot.platforms?.googleSites) platformsToPublish.push('googleSites');

    if (settings.autoPilot.autoPublish && platformsToPublish.length > 0) {
      console.log(`[SEO AutoPilot] Auto-publishing to platforms: ${platformsToPublish.join(', ')}...`);
      publishResults = await publishPostToPlatforms(newPost._id, platformsToPublish, {
        dryRun: false
      });
    }

    // 5. Update settings and log activity
    settings.autoPilot.lastRunAt = new Date();
    settings.autoPilot.lastStatus = 'success';

    // Calculate approximate next run time
    const intervalMs = (settings.autoPilot.intervalHours || 24) * 60 * 60 * 1000;
    settings.autoPilot.nextRunAt = new Date(Date.now() + intervalMs);

    settings.activityLogs.unshift({
      timestamp: new Date(),
      action: settings.autoPilot.autoPublish ? 'publish' : 'generate',
      subject: chosenSubject,
      blogPostId: newPost._id,
      blogTitle: newPost.title,
      platforms: platformsToPublish,
      success: true,
      message: settings.autoPilot.autoPublish
        ? `Generated and published to ${platformsToPublish.join(', ')}`
        : `Generated unique SEO article as draft for review`,
      details: {
        uniquenessScore: newPost.uniquenessScore,
        wordCount: newPost.wordCount,
        publishResults: publishResults?.results
      }
    });

    // Keep activity log limited to last 100 entries
    if (settings.activityLogs.length > 100) {
      settings.activityLogs = settings.activityLogs.slice(0, 100);
    }

    await settings.save();

    console.log('[SEO AutoPilot] Cycle completed successfully.');
    return {
      success: true,
      post: newPost,
      published: Boolean(publishResults),
      publishResults: publishResults?.results
    };
  } catch (err) {
    console.error('[SEO AutoPilot] Cycle failed:', err);
    settings.autoPilot.lastStatus = 'error';

    settings.activityLogs.unshift({
      timestamp: new Date(),
      action: 'error',
      success: false,
      message: `Auto-Pilot execution failed: ${err.message}`,
      details: { stack: err.stack }
    });

    await settings.save();
    return { success: false, error: err.message };
  } finally {
    isCycleRunning = false;
  }
}

/**
 * Configure and register the Node-Cron scheduler based on current DB settings
 */
async function initializeAutoPilotScheduler() {
  try {
    const settings = await SeoSettings.getSettings();

    if (currentCronJob) {
      currentCronJob.stop();
      currentCronJob = null;
      console.log('[SEO AutoPilot] Previous scheduler stopped.');
    }

    if (!settings.autoPilot.enabled) {
      console.log('[SEO AutoPilot] Scheduler is currently disabled in settings.');
      return;
    }

    // Default cron schedule: run once daily, or build from intervalHours
    let cronPattern = settings.autoPilot.cronSchedule || '0 9 * * *';
    const intervalHours = settings.autoPilot.intervalHours || 24;

    if (intervalHours < 24) {
      cronPattern = `0 */${intervalHours} * * *`;
    }

    if (!cron.validate(cronPattern)) {
      console.warn(`[SEO AutoPilot] Invalid cron pattern "${cronPattern}". Defaulting to "0 9 * * *"`);
      cronPattern = '0 9 * * *';
    }

    currentCronJob = cron.schedule(cronPattern, async () => {
      console.log(`[SEO AutoPilot] Cron trigger fired with pattern: ${cronPattern}`);
      await runAutoPilotCycle('cron');
    });

    console.log(`[SEO AutoPilot] Background scheduler active with pattern: "${cronPattern}"`);
  } catch (err) {
    console.warn('[SEO AutoPilot] Scheduler initialization warning:', err.message);
  }
}

module.exports = {
  runAutoPilotCycle,
  initializeAutoPilotScheduler,
  GOOGLE_APPS_SCRIPT_TEMPLATE
};

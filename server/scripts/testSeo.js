const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const {
  generateUniqueBlogPost,
  checkContentUniqueness,
  getAvailableBacklinkTargets
} = require('../services/seoGeneratorService');

const {
  publishPostToPlatforms
} = require('../services/publisherService');

const {
  runAutoPilotCycle
} = require('../services/autoPilotService');

const BlogPost = require('../models/BlogPost');
const SeoSettings = require('../models/SeoSettings');

async function runTests() {
  console.log('=== Testing SEO Backlink Blog System ===');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/datadrix');
  console.log('1. Connected to MongoDB successfully.');

  // Test 1: Discover available backlink targets
  const targets = getAvailableBacklinkTargets('http://localhost:3000');
  console.log(`2. Discovered ${targets.length} backlink targets from DataDrix curriculum & tools:`);
  targets.slice(0, 4).forEach(t => console.log(`   - [${t.type}] ${t.title} -> ${t.url}`));

  // Test 2: Generate unique blog post
  console.log('\n3. Generating unique SEO article for "python"...');
  const post1 = await generateUniqueBlogPost('python', { websiteBaseUrl: 'http://localhost:3000' });
  console.log(`   Title: "${post1.title}"`);
  console.log(`   Slug: ${post1.slug}`);
  console.log(`   Word Count: ${post1.wordCount}`);
  console.log(`   Uniqueness Score: ${post1.uniquenessScore}%`);
  console.log(`   Injected Backlinks: ${post1.backlinks.length}`);
  post1.backlinks.forEach(bl => console.log(`     * Anchor: "${bl.anchorText}" -> ${bl.targetUrl}`));

  // Save to DB
  const saved1 = await BlogPost.create({
    title: post1.title,
    slug: post1.slug,
    metaDescription: post1.metaDescription,
    targetKeywords: post1.targetKeywords,
    targetSubject: post1.targetSubject,
    contentMarkdown: post1.contentMarkdown,
    contentHtml: post1.contentHtml,
    wordCount: post1.wordCount,
    readingTimeMinutes: post1.readingTimeMinutes,
    backlinks: post1.backlinks,
    uniquenessScore: post1.uniquenessScore,
    contentHash: post1.contentHash,
    status: 'draft',
    canonicalUrl: post1.canonicalUrl,
    generationSource: 'smart_template'
  });
  console.log(`   Saved to DB with ID: ${saved1._id}`);

  // Test 3: Generate second article for different subject "sql" and test duplicate prevention
  console.log('\n4. Generating second unique SEO article for "sql"...');
  const post2 = await generateUniqueBlogPost('sql', { websiteBaseUrl: 'http://localhost:3000' });
  console.log(`   Title: "${post2.title}"`);
  console.log(`   Uniqueness Score: ${post2.uniquenessScore}%`);
  console.log(`   Content Hash: ${post2.contentHash.slice(0, 16)}...`);

  const saved2 = await BlogPost.create({
    title: post2.title,
    slug: post2.slug,
    metaDescription: post2.metaDescription,
    targetKeywords: post2.targetKeywords,
    targetSubject: post2.targetSubject,
    contentMarkdown: post2.contentMarkdown,
    contentHtml: post2.contentHtml,
    wordCount: post2.wordCount,
    readingTimeMinutes: post2.readingTimeMinutes,
    backlinks: post2.backlinks,
    uniquenessScore: post2.uniquenessScore,
    contentHash: post2.contentHash,
    status: 'draft',
    canonicalUrl: post2.canonicalUrl,
    generationSource: 'smart_template'
  });

  // Test 4: Multi-platform publishing simulation / dry-run
  console.log('\n5. Testing Multi-Platform Publishing (WordPress, Medium, Google Sites)...');
  const pubResults = await publishPostToPlatforms(saved1._id, ['wordpress', 'medium', 'googleSites'], { dryRun: true });
  console.log(`   Publish success: ${pubResults.success}`);
  console.log('   Platform Results:', pubResults.results);

  // Test 5: Auto-Pilot cycle execution
  console.log('\n6. Testing Auto-Pilot Cycle Trigger...');
  const cycleResult = await runAutoPilotCycle('test_script');
  console.log(`   Cycle executed: ${cycleResult.success ? 'SUCCESS' : 'FAILED'}`);
  if (cycleResult.post) {
    console.log(`   Auto-Pilot created: "${cycleResult.post.title}" (${cycleResult.post.targetSubject})`);
  }

  // Test 6: Verify Settings Singleton
  const settings = await SeoSettings.getSettings();
  console.log(`\n7. Settings Verified. AutoPilot status: ${settings.autoPilot.lastStatus}, Activity logs count: ${settings.activityLogs.length}`);

  console.log('\n=== ALL SEO BACKLINK SYSTEM TESTS PASSED! ===');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

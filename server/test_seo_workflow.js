/**
 * Test Suite: AI-Powered SEO Blog Workflow & Publishing Verification
 * Tests:
 * 1. Article generation with technical accuracy & rich markdown
 * 2. Contextual backlink insertion & canonical URL enforcement
 * 3. Duplicate detection & uniqueness scoring
 * 4. 1-click manual payloads for Dev.to, Hashnode, and Medium
 * 5. Dry-run publishing and platform status tracking
 */

const { generateUniqueBlogPost, checkContentUniqueness, SUBJECT_METADATA } = require('./services/seoGeneratorService');
const {
  prepareManualPublishingPayload,
  publishPostToPlatforms,
  testDevToConnection,
  testHashnodeConnection
} = require('./services/publisherService');
const BlogPost = require('./models/BlogPost');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING SEO WORKFLOW INTEGRATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // TEST 1: Generate Blog Post for Python
    console.log('--- TEST 1: Article Generation & Technical Content ---');
    const targetUrl = 'https://learnforge-learning-platform.onrender.com';
    const postData = await generateUniqueBlogPost('python', {
      websiteBaseUrl: targetUrl,
      forceProvider: 'smart_template'
    });

    assert(Boolean(postData.title), `Title generated: "${postData.title}"`);
    assert(Boolean(postData.contentMarkdown && postData.contentMarkdown.length > 300), `Markdown length: ${postData.contentMarkdown.length} chars`);
    assert(Boolean(postData.contentHtml && postData.contentHtml.includes('<')), `HTML rendered properly`);
    assert(postData.targetSubject === 'python', `Target subject is python`);
    assert(Boolean(postData.metaDescription), `Meta description generated: "${postData.metaDescription.slice(0, 60)}..."`);
    assert(Array.isArray(postData.tags) && postData.tags.length > 0, `Tags generated: ${postData.tags.join(', ')}`);

    // TEST 2: Contextual Backlinks & Canonical URL
    console.log('\n--- TEST 2: Backlink & Canonical URL Verification ---');
    assert(postData.canonicalUrl === `${targetUrl}/python`, `Canonical URL correctly set: ${postData.canonicalUrl}`);
    assert(postData.contentMarkdown.includes(targetUrl), `Markdown contains contextual backlink to ${targetUrl}`);
    assert(postData.contentHtml.includes(targetUrl), `HTML contains clickable backlink to ${targetUrl}`);

    // Verify backlink anchors
    const backlinkMatches = postData.backlinks || [];
    assert(backlinkMatches.length > 0, `Recorded ${backlinkMatches.length} backlink anchor targets`);
    for (const link of backlinkMatches) {
      console.log(`    🔗 Anchor: "${link.anchorText}" -> URL: ${link.targetUrl}`);
    }

    // TEST 3: Duplicate Check & Uniqueness
    console.log('\n--- TEST 3: Duplicate Content & Uniqueness Hash ---');
    const uniqueness = await checkContentUniqueness(postData.contentMarkdown);
    assert(typeof uniqueness.uniquenessScore === 'number', `Uniqueness score computed: ${uniqueness.uniquenessScore}%`);
    assert(Boolean(uniqueness.hash), `SHA-256 hash computed: ${uniqueness.hash}`);

    // Identical content should yield duplicate match
    const duplicateCheck = await checkContentUniqueness(postData.contentMarkdown, null, [
      { contentMarkdown: postData.contentMarkdown, contentHash: uniqueness.hash, title: postData.title }
    ]);
    assert(duplicateCheck.isDuplicate === true, `Exact match correctly flagged as duplicate (score: ${duplicateCheck.uniquenessScore}%)`);

    // TEST 4: Manual Publishing Payloads (Dev.to, Hashnode, Medium)
    console.log('\n--- TEST 4: Manual Publishing Payloads ---');
    const mockPost = new BlogPost({
      title: postData.title,
      slug: postData.slug,
      targetSubject: postData.targetSubject,
      contentMarkdown: postData.contentMarkdown,
      contentHtml: postData.contentHtml,
      metaDescription: postData.metaDescription,
      canonicalUrl: postData.canonicalUrl,
      tags: postData.tags,
      backlinks: postData.backlinks,
      uniquenessScore: postData.uniquenessScore,
      contentHash: postData.contentHash,
      status: 'draft'
    });

    const payloads = prepareManualPublishingPayload(mockPost);

    // Dev.to payload
    assert(Boolean(payloads.devto), 'Dev.to payload exists');
    assert(payloads.devto.targetUrl === 'https://dev.to/new', 'Dev.to target URL is https://dev.to/new');
    assert(payloads.devto.frontmatter.includes('canonical_url:'), 'Dev.to frontmatter contains canonical_url');
    assert(payloads.devto.frontmatter.includes('published: false'), 'Dev.to frontmatter sets published: false (draft safety)');
    assert(payloads.devto.markdown.startsWith('---'), 'Dev.to markdown includes prepended YAML frontmatter');

    // Hashnode payload
    assert(Boolean(payloads.hashnode), 'Hashnode payload exists');
    assert(payloads.hashnode.targetUrl === 'https://hashnode.com/draft', 'Hashnode target URL is https://hashnode.com/draft');
    assert(payloads.hashnode.canonicalUrl === mockPost.canonicalUrl, 'Hashnode canonical URL matches post canonicalUrl');
    assert(payloads.hashnode.title === mockPost.title, 'Hashnode title matches post title');

    // Medium payload
    assert(Boolean(payloads.medium), 'Medium payload exists');
    assert(payloads.medium.targetUrl === 'https://medium.com/new-story', 'Medium target URL is https://medium.com/new-story');
    assert(payloads.medium.canonicalUrl === mockPost.canonicalUrl, 'Medium canonical URL matches post canonicalUrl');
    assert(payloads.medium.tags.length <= 5, `Medium tags count: ${payloads.medium.tags.length} (within Medium's 5 tag limit)`);

    // TEST 5: Publishing Simulation & Status Tracking (Dry Run)
    console.log('\n--- TEST 5: Publishing Simulation / Dry Run Mode ---');
    const publishResult = await publishPostToPlatforms(mockPost, {
      platforms: ['medium', 'devto', 'hashnode'],
      dryRun: true
    });

    assert(publishResult.success === true, 'Dry run returned overall success: true');
    assert(publishResult.results.devto?.isDryRun === true, 'Dev.to ran in simulation mode without public publishing');
    assert(publishResult.results.hashnode?.isDryRun === true, 'Hashnode ran in simulation mode without public publishing');
    assert(publishResult.results.medium?.isDryRun === true, 'Medium ran in simulation mode without public publishing');
    assert(mockPost.platformPublications.devto?.status === 'draft', 'Dev.to publication status tracked as "draft"');
    assert(mockPost.platformPublications.hashnode?.status === 'draft', 'Hashnode publication status tracked as "draft"');
    assert(mockPost.isPublishedAnywhere === false, 'Virtual isPublishedAnywhere remains false for safe drafts');
    mockPost.platformPublications.devto.status = 'published';
    assert(mockPost.isPublishedAnywhere === true, 'Virtual isPublishedAnywhere becomes true when an article is published live');

    // TEST 6: Connection Testers with missing credentials
    let devRejected = false;
    try {
      await testDevToConnection('invalid_dummy_key_12345');
    } catch (e) {
      devRejected = true;
    }
    assert(devRejected === true, 'Dev.to rejected dummy key gracefully with error');

    let hashRejected = false;
    try {
      await testHashnodeConnection({ accessToken: 'invalid_token' });
    } catch (e) {
      hashRejected = true;
    }
    assert(hashRejected === true, 'Hashnode rejected dummy token gracefully with error');

  } catch (err) {
    console.error('Unexpected test error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

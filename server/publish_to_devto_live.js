const mongoose = require('mongoose');
const BlogPost = require('./models/BlogPost');
const SeoSettings = require('./models/SeoSettings');
const { generateUniqueBlogPost } = require('./services/seoGeneratorService');
const { publishToDevTo } = require('./services/publisherService');

async function publishLiveToDevTo() {
  try {
    console.log('Generating fresh high-quality article for Dev.to...');
    const generated = await generateUniqueBlogPost('python', {
      websiteBaseUrl: 'https://learnforge-learning-platform.onrender.com',
      forceProvider: 'smart_template'
    });

    console.log('Generated article:', generated.title);
    console.log('Canonical URL:', generated.canonicalUrl);
    console.log('Backlinks count:', generated.backlinks.length);

    // Clean Dev.to tags (max 4, alphanumeric only)
    const cleanTags = (generated.tags || ['python', 'programming', 'webdev', 'technology'])
      .map(t => t.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter(t => t.length >= 1 && t.length <= 30)
      .slice(0, 4);

    console.log('Publishing to Dev.to via official API...');
    const result = await publishToDevTo({
      title: generated.title,
      contentMarkdown: generated.contentMarkdown,
      contentHtml: generated.contentHtml,
      canonicalUrl: generated.canonicalUrl,
      metaDescription: generated.metaDescription,
      targetKeywords: cleanTags
    }, {
      apiKey: 'knx6tXDdpSKmwoC3mm7DZ9SD',
      status: 'published' // Publish live to their Dev.to account!
    });

    console.log('\n=============================================');
    console.log('🎉 SUCCESSFULLY PUBLISHED TO DEV.TO!');
    console.log('Post ID:', result.postId);
    console.log('Live URL:', result.url);
    console.log('=============================================\n');

    // Also save post to MongoDB if connected
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/datadrix');
      const saved = await BlogPost.create({
        title: generated.title,
        slug: generated.slug,
        metaDescription: generated.metaDescription,
        targetKeywords: cleanTags,
        targetSubject: 'python',
        topicAngle: generated.topicAngle,
        contentMarkdown: generated.contentMarkdown,
        contentHtml: generated.contentHtml,
        wordCount: generated.wordCount,
        readingTimeMinutes: generated.readingTimeMinutes,
        backlinks: generated.backlinks,
        uniquenessScore: generated.uniquenessScore,
        contentHash: generated.contentHash,
        status: 'published',
        canonicalUrl: generated.canonicalUrl,
        generationSource: 'smart_template',
        platformPublications: {
          devto: {
            status: 'published',
            postId: result.postId,
            url: result.url,
            publishedAt: new Date()
          }
        }
      });
      console.log('Saved to LearnForge BlogPost database with ID:', saved._id);
    } catch (dbErr) {
      console.log('DB Note:', dbErr.message);
    }

  } catch (err) {
    console.error('Publishing failed:', err);
  } finally {
    process.exit(0);
  }
}

publishLiveToDevTo();

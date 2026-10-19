const BlogPost = require('../models/BlogPost');
const SeoSettings = require('../models/SeoSettings');

/**
 * -------------------------------------------------------------
 * 1. WORDPRESS REST API PUBLISHER
 * -------------------------------------------------------------
 */
async function publishToWordPress(post, options = {}) {
  const settings = await SeoSettings.getSettings();
  const wpConfig = settings.wordpress || {};

  const siteUrl = (options.siteUrl || wpConfig.siteUrl || '').replace(/\/$/, '');
  const username = options.username || wpConfig.username || '';
  const applicationPassword = (options.applicationPassword || wpConfig.applicationPassword || '').replace(/\s+/g, '');
  const publishStatus = options.status || wpConfig.defaultStatus || 'draft';

  // If credentials are missing, check if dry-run requested or return structured error
  if (!siteUrl || !username || !applicationPassword) {
    if (options.dryRun) {
      return {
        success: true,
        isDryRun: true,
        postId: `wp-demo-${Date.now()}`,
        url: `${siteUrl || 'https://demo.wordpress.com'}/?p=101`,
        message: 'WordPress Dry Run Successful. Real publishing requires WordPress site URL, username & Application Password.'
      };
    }
    throw new Error('WordPress publishing requires site URL, username, and Application Password.');
  }

  const endpoint = `${siteUrl}/wp-json/wp/v2/posts`;
  const authHeader = `Basic ${Buffer.from(`${username}:${applicationPassword}`).toString('base64')}`;

  const payload = {
    title: post.title,
    content: post.contentHtml || post.contentMarkdown,
    status: publishStatus, // 'draft' or 'publish'
    excerpt: post.metaDescription,
    format: 'standard'
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsed;
    try { parsed = JSON.parse(errorBody); } catch (e) {}
    const msg = parsed?.message || errorBody || `HTTP error ${response.status}`;
    throw new Error(`WordPress API failed (${response.status}): ${msg}`);
  }

  const data = await response.json();

  return {
    success: true,
    postId: String(data.id),
    url: data.link || `${siteUrl}/?p=${data.id}`,
    status: data.status,
    publishedAt: new Date()
  };
}

async function testWordPressConnection(credentials = {}) {
  const settings = await SeoSettings.getSettings();
  const siteUrl = (credentials.siteUrl || settings.wordpress?.siteUrl || '').replace(/\/$/, '');
  const username = credentials.username || settings.wordpress?.username || '';
  const appPassword = (credentials.applicationPassword || settings.wordpress?.applicationPassword || '').replace(/\s+/g, '');

  if (!siteUrl || !username || !appPassword) {
    throw new Error('Please enter Site URL, Username, and Application Password to test.');
  }

  const endpoint = `${siteUrl}/wp-json/wp/v2/users/me`;
  const authHeader = `Basic ${Buffer.from(`${username}:${appPassword}`).toString('base64')}`;

  const response = await fetch(endpoint, {
    headers: {
      'Authorization': authHeader,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WordPress connection test failed (${response.status}): ${errorText}`);
  }

  const user = await response.json();
  return {
    success: true,
    user: user.name || user.slug || username,
    siteUrl,
    message: `Connected successfully to WordPress as "${user.name || username}"`
  };
}

/**
 * -------------------------------------------------------------
 * 2. MEDIUM REST API PUBLISHER
 * -------------------------------------------------------------
 */
async function publishToMedium(post, options = {}) {
  const settings = await SeoSettings.getSettings();
  const medConfig = settings.medium || {};

  const integrationToken = options.integrationToken || medConfig.integrationToken || '';
  const publishStatus = options.status || medConfig.defaultStatus || 'draft'; // 'draft', 'public', 'unlisted'

  if (!integrationToken) {
    if (options.dryRun) {
      return {
        success: true,
        isDryRun: true,
        postId: `med-demo-${Date.now()}`,
        url: 'https://medium.com/@demo/sample-seo-backlink-post',
        message: 'Medium Dry Run Successful. Real publishing requires Medium Integration Token.'
      };
    }
    throw new Error('Medium publishing requires an Integration Token (generate in Medium Settings -> Security -> Integration Tokens).');
  }

  // Step 1: Ensure we have authorId
  let authorId = options.authorId || medConfig.authorId;
  if (!authorId) {
    const meRes = await fetch('https://api.medium.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${integrationToken}`,
        'Accept': 'application/json'
      }
    });

    if (!meRes.ok) {
      const errTxt = await meRes.text();
      throw new Error(`Failed to retrieve Medium User ID (${meRes.status}): ${errTxt}`);
    }

    const meData = await meRes.json();
    authorId = meData?.data?.id;

    // Cache authorId in settings for subsequent calls
    if (authorId) {
      settings.medium.authorId = authorId;
      settings.medium.username = meData.data.username || '';
      await settings.save();
    }
  }

  if (!authorId) {
    throw new Error('Could not resolve Medium Author ID.');
  }

  // Medium publishing rules: max 5 tags
  const tags = (post.targetKeywords || [])
    .map(k => k.replace(/[^a-zA-Z0-9\s]/g, '').trim())
    .filter(Boolean)
    .slice(0, 5);

  const endpoint = `https://api.medium.com/v1/users/${authorId}/posts`;

  // Medium content payload
  const contentBody = `# ${post.title}\n\n${post.contentMarkdown}`;

  const payload = {
    title: post.title,
    contentFormat: 'markdown',
    content: contentBody,
    tags,
    canonicalUrl: post.canonicalUrl || 'http://localhost:3000',
    publishStatus,
    notifyFollowers: medConfig.notifyFollowers || false
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${integrationToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Medium API failed (${response.status}): ${errorBody}`);
  }

  const result = await response.json();
  const data = result?.data || {};

  return {
    success: true,
    postId: String(data.id),
    url: data.url || `https://medium.com/p/${data.id}`,
    status: data.publishStatus || publishStatus,
    publishedAt: new Date()
  };
}

async function testMediumConnection(credentials = {}) {
  const settings = await SeoSettings.getSettings();
  const token = credentials.integrationToken || settings.medium?.integrationToken;

  if (!token) {
    throw new Error('Please enter a Medium Integration Token to test.');
  }

  const response = await fetch('https://api.medium.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Medium connection test failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const user = data?.data || {};

  return {
    success: true,
    authorId: user.id,
    username: user.username,
    name: user.name,
    url: user.url,
    message: `Connected successfully to Medium as "${user.name || user.username}" (@${user.username})`
  };
}

/**
 * -------------------------------------------------------------
 * 3. GOOGLE SITES / APPS SCRIPT WEBHOOK PUBLISHER
 * -------------------------------------------------------------
 */
async function publishToGoogleSites(post, options = {}) {
  const settings = await SeoSettings.getSettings();
  const gsConfig = settings.googleSites || {};

  const webhookUrl = options.webhookUrl || gsConfig.webhookUrl || '';
  const secretToken = options.secretToken || gsConfig.secretToken || 'datadrix-sites-secret-key-2026';
  const siteUrl = options.siteUrl || gsConfig.siteUrl || '';

  // If webhookUrl is configured, dispatch payload to Google Apps Script
  if (webhookUrl) {
    const payload = {
      action: 'publish_post',
      secretToken,
      title: post.title,
      slug: post.slug,
      metaDescription: post.metaDescription,
      contentHtml: post.contentHtml,
      contentMarkdown: post.contentMarkdown,
      backlinks: post.backlinks,
      targetKeywords: post.targetKeywords,
      canonicalUrl: post.canonicalUrl,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Apps Script responded with ${response.status}: ${errorText}`);
      }

      const resData = await response.json().catch(() => ({}));

      return {
        success: true,
        postId: resData.pageId || `gs-${post.slug}`,
        url: resData.pageUrl || siteUrl || webhookUrl,
        status: 'published',
        publishedAt: new Date()
      };
    } catch (err) {
      throw new Error(`Google Sites Apps Script dispatch error: ${err.message}`);
    }
  }

  // Fallback: If no webhook URL is yet configured, generate the clean Google Sites embed export
  if (options.dryRun || !webhookUrl) {
    return {
      success: true,
      isDryRun: !webhookUrl,
      postId: `gs-embed-${post.slug}`,
      url: siteUrl || 'https://sites.google.com/view/datadrix-academy/blog',
      message: webhookUrl
        ? 'Published via Google Apps Script Webhook.'
        : 'Google Sites Embed Bundle ready. Deploy the free Google Apps Script webhook or paste embed code into Google Sites.'
    };
  }
}

async function testGoogleSitesConnection(credentials = {}) {
  const settings = await SeoSettings.getSettings();
  const webhookUrl = credentials.webhookUrl || settings.googleSites?.webhookUrl;
  const secretToken = credentials.secretToken || settings.googleSites?.secretToken || 'datadrix-sites-secret-key-2026';

  if (!webhookUrl) {
    throw new Error('Please enter your Google Apps Script Webhook URL to test.');
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'ping',
      secretToken,
      test: true
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Apps Script ping failed (${response.status}): ${errorText}`);
  }

  const data = await response.json().catch(() => ({ status: 'received' }));

  return {
    success: true,
    data,
    message: 'Google Apps Script Webhook acknowledged ping successfully!'
  };
}

/**
 * -------------------------------------------------------------
 * 4. GOOGLE GEMINI AI CONNECTION TEST
 * -------------------------------------------------------------
 */
async function testGeminiConnection(apiKey, model = 'gemini-1.5-flash') {
  if (!apiKey) {
    throw new Error('Please enter a Gemini API Key to test.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: 'Respond with the word "CONNECTED" only.' }]
      }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API connection failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'CONNECTED';

  return {
    success: true,
    model,
    reply,
    message: `Gemini API Key validated successfully with model ${model}!`
  };
}

/**
 * -------------------------------------------------------------
 * 5. UNIFIED MULTI-PLATFORM DISPATCHER
 * -------------------------------------------------------------
 */
async function publishPostToPlatforms(blogPostId, platformsToPublish = [], options = {}) {
  const post = await BlogPost.findById(blogPostId);
  if (!post) {
    throw new Error('Blog post not found.');
  }

  post.status = 'publishing';
  await post.save();

  const results = {};
  const requestedPlatforms = platformsToPublish.length > 0
    ? platformsToPublish
    : ['wordpress', 'medium', 'googleSites'];

  // WordPress Execution
  if (requestedPlatforms.includes('wordpress')) {
    try {
      const res = await publishToWordPress(post, options);
      post.platformPublications.wordpress = {
        status: 'published',
        postId: res.postId,
        url: res.url,
        publishedAt: res.publishedAt || new Date(),
        error: null
      };
      results.wordpress = { success: true, url: res.url, isDryRun: res.isDryRun };
    } catch (err) {
      post.platformPublications.wordpress = {
        status: 'failed',
        error: err.message
      };
      results.wordpress = { success: false, error: err.message };
    }
  }

  // Medium Execution
  if (requestedPlatforms.includes('medium')) {
    try {
      const res = await publishToMedium(post, options);
      post.platformPublications.medium = {
        status: 'published',
        postId: res.postId,
        url: res.url,
        publishedAt: res.publishedAt || new Date(),
        error: null
      };
      results.medium = { success: true, url: res.url, isDryRun: res.isDryRun };
    } catch (err) {
      post.platformPublications.medium = {
        status: 'failed',
        error: err.message
      };
      results.medium = { success: false, error: err.message };
    }
  }

  // Google Sites Execution
  if (requestedPlatforms.includes('googleSites')) {
    try {
      const res = await publishToGoogleSites(post, options);
      post.platformPublications.googleSites = {
        status: 'published',
        postId: res.postId,
        url: res.url,
        publishedAt: res.publishedAt || new Date(),
        error: null
      };
      results.googleSites = { success: true, url: res.url, isDryRun: res.isDryRun };
    } catch (err) {
      post.platformPublications.googleSites = {
        status: 'failed',
        error: err.message
      };
      results.googleSites = { success: false, error: err.message };
    }
  }

  // Determine overall status
  const anySuccess = Object.values(results).some(r => r.success);
  post.status = anySuccess ? 'published' : 'failed';
  await post.save();

  return {
    success: anySuccess,
    post,
    results
  };
}

module.exports = {
  publishToWordPress,
  testWordPressConnection,
  publishToMedium,
  testMediumConnection,
  publishToGoogleSites,
  testGoogleSitesConnection,
  testGeminiConnection,
  publishPostToPlatforms
};

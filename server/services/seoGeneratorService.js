const crypto = require('crypto');
const path = require('path');
const { Marked } = require('marked');
const { markedHighlight } = require('marked-highlight');
const hljs = require('highlight.js');
const { listSubjects, buildSubjectTree } = require('./contentLoader');
const BlogPost = require('../models/BlogPost');
const SeoSettings = require('../models/SeoSettings');

// Initialize markdown compiler with syntax highlighting
const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);
marked.setOptions({ gfm: true, breaks: true });

// Subject metadata map for intelligent keyword & title generation
const SUBJECT_METADATA = {
  python: {
    name: 'Python',
    category: 'Programming & Automation',
    keywords: ['Python tutorial', 'learn Python online', 'Python programming guide', 'Python data structures', 'clean code Python', 'Python automation'],
    anchors: ['DataDrix Python Mastery Curriculum', 'hands-on Python coding tutorials', 'complete Python course', 'interactive Python learning modules'],
    codeSnippet: `def process_dataset(records: list[dict]) -> dict:\n    """Clean and aggregate incoming data records efficiently."""\n    summary = {"valid_count": 0, "total_value": 0.0}\n    for item in records:\n        if item.get("status") == "active":\n            summary["valid_count"] += 1\n            summary["total_value"] += float(item.get("amount", 0))\n    return summary\n\n# Example execution\nrecords = [{"amount": 149.50, "status": "active"}, {"amount": 29.99, "status": "pending"}]\nprint(process_dataset(records))`
  },
  sql: {
    name: 'SQL & Database Design',
    category: 'Data Engineering & Databases',
    keywords: ['SQL queries tutorial', 'master SQL joins', 'database optimization', 'PostgreSQL vs MySQL', 'learn SQL step by step', 'SQL index performance'],
    anchors: ['DataDrix interactive SQL curriculum', 'master SQL database design', 'practical SQL query exercises', 'SQL problem-solving platform'],
    codeSnippet: `-- Advanced Window Function for Customer Analytics\nWITH RankedOrders AS (\n    SELECT \n        customer_id,\n        order_date,\n        total_amount,\n        ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS recency_rank\n    FROM orders\n    WHERE status = 'completed'\n)\nSELECT customer_id, order_date, total_amount\nFROM RankedOrders\nWHERE recency_rank = 1;`
  },
  pandas: {
    name: 'Pandas Data Analysis',
    category: 'Data Science',
    keywords: ['Pandas tutorial', 'Pandas DataFrame manipulation', 'data cleaning with Python Pandas', 'Pandas groupby aggregation', 'data science workflows'],
    anchors: ['DataDrix comprehensive Pandas modules', 'learn Pandas DataFrame manipulation', 'complete Pandas data analysis track'],
    codeSnippet: `import pandas as pd\n\n# Vectorized cleaning and transformation\ndf = pd.DataFrame({\n    'user': ['Alice', 'Bob', 'Charlie'],\n    'score': [88, 92, 79],\n    'category': ['Engineering', 'Data', 'Engineering']\n})\n\nresult = df.groupby('category')['score'].agg(['mean', 'count']).reset_index()\nprint(result)`
  },
  numpy: {
    name: 'NumPy High Performance',
    category: 'Data Science & Scientific Computing',
    keywords: ['NumPy tutorial', 'NumPy arrays vs Python lists', 'vectorized operations', 'NumPy matrix mathematics', 'scientific computing'],
    anchors: ['DataDrix NumPy tutorials', 'master vectorization with NumPy', 'NumPy scientific computing path'],
    codeSnippet: `import numpy as np\n\n# Vectorized matrix transformation\nmatrix_a = np.random.rand(1000, 100)\nweights = np.random.rand(100)\n\n# Fast dot product execution\nprojections = np.dot(matrix_a, weights)\nprint(f"Computed {len(projections)} projection vectors with zero Python loops.")`
  },
  'machine-learning': {
    name: 'Machine Learning & AI',
    category: 'Artificial Intelligence',
    keywords: ['Machine Learning algorithms', 'Scikit-Learn tutorial', 'Supervised vs Unsupervised ML', 'Model evaluation metrics', 'train test split guide'],
    anchors: ['DataDrix Machine Learning curriculum', 'hands-on ML algorithms course', 'practical AI and Machine Learning track'],
    codeSnippet: `from sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import classification_report\n\n# Standard ML production pipeline pattern\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\nclf = RandomForestClassifier(n_estimators=100, random_state=42)\nclf.fit(X_train, y_train)\n\npredictions = clf.predict(X_test)\nprint(classification_report(y_test, predictions))`
  },
  'web-scraping': {
    name: 'Web Scraping & Data Extraction',
    category: 'Data Engineering & Web Automation',
    keywords: ['Python web scraping', 'BeautifulSoup tutorial', 'handling dynamic websites', 'scraping best practices', 'preventing IP bans scraping'],
    anchors: ['DataDrix Web Scraping interactive guide', 'master Python web scraping', 'automated data extraction course'],
    codeSnippet: `import requests\nfrom bs4 import BeautifulSoup\n\nurl = "https://example.com/catalog"\nheaders = {"User-Agent": "Mozilla/5.0 (DataDrix-Bot/1.0)"}\n\nresponse = requests.get(url, headers=headers, timeout=10)\nif response.ok:\n    soup = BeautifulSoup(response.text, "html.parser")\n    titles = [tag.get_text(strip=True) for tag in soup.select("h2.entry-title")]\n    print(f"Successfully parsed {len(titles)} catalog entries.")`
  },
  javascript: {
    name: 'Modern JavaScript (ES6+)',
    category: 'Full-Stack Web Development',
    keywords: ['JavaScript tutorial', 'Async Await JavaScript', 'closures and event loop', 'modern ES6 features', 'learn JavaScript free'],
    anchors: ['DataDrix modern JavaScript track', 'learn full-stack JavaScript', 'interactive JavaScript modules'],
    codeSnippet: `// Modern async concurrency with Promise.allSettled\nasync function fetchBatch(endpoints) {\n  const results = await Promise.allSettled(\n    endpoints.map(url => fetch(url).then(res => res.json()))\n  );\n  return results\n    .filter(r => r.status === 'fulfilled')\n    .map(r => r.value);\n}`
  },
  flask: {
    name: 'Flask Python Web Framework',
    category: 'Backend Development',
    keywords: ['Flask tutorial', 'Flask REST API development', 'Flask Blueprints pattern', 'deploying Flask apps', 'Python web development'],
    anchors: ['DataDrix Flask backend course', 'master Flask REST API building', 'Python backend architecture guide'],
    codeSnippet: `from flask import Flask, jsonify, request\n\napp = Flask(__name__)\n\n@app.route('/api/health', methods=['GET'])\ndef health_check():\n    return jsonify({"status": "healthy", "service": "DataDrix-Service"})\n\nif __name__ == '__main__':\n    app.run(debug=False, port=5000)`
  },
  'power-bi': {
    name: 'Power BI Business Intelligence',
    category: 'Data Analytics & Visualization',
    keywords: ['Power BI tutorial', 'DAX formulas guide', 'Power BI dashboard design', 'data modeling Power BI', 'business intelligence tools'],
    anchors: ['DataDrix Power BI mastery path', 'learn DAX and Power BI dashboards', 'practical business intelligence track'],
    codeSnippet: `// DAX Measure for Year-Over-Year Growth Calculation\nYoY_Sales_Growth % =\nVAR CurrentYearSales = [Total Sales]\nVAR PriorYearSales = CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Calendar'[Date]))\nRETURN\n    DIVIDE(CurrentYearSales - PriorYearSales, PriorYearSales, 0)`
  },
  excel: {
    name: 'Advanced Excel & Analytics',
    category: 'Productivity & Analytics',
    keywords: ['Advanced Excel formulas', 'XLOOKUP tutorial', 'Excel Pivot Tables', 'Excel automation', 'data analysis in Excel'],
    anchors: ['DataDrix Excel analytics training', 'master Excel formulas and dashboards', 'complete Excel training path'],
    codeSnippet: `=XLOOKUP(A2, Customers[CustomerID], Customers[Email], "Not Found", 0, 1)`
  }
};

/**
 * Text normalizer for SHA-256 fingerprinting
 */
function normalizeContentForHash(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 5000);
}

/**
 * Generate 3-gram character and word tokens for Jaccard similarity
 */
function getTrigrams(text) {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  const trigrams = new Set();
  for (let i = 0; i < words.length - 2; i++) {
    trigrams.add(`${words[i]}_${words[i + 1]}_${words[i + 2]}`);
  }
  return trigrams;
}

/**
 * Calculate Jaccard similarity percentage between two sets of trigrams
 */
function calculateJaccardSimilarity(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }
  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : (intersectionCount / unionCount) * 100;
}

/**
 * Helper to slugify strings for SEO URLs
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Discover real website subjects, lessons, and interactive tools for natural backlinks
 */
function getAvailableBacklinkTargets(websiteBaseUrl = 'http://localhost:3000') {
  const baseUrl = websiteBaseUrl.replace(/\/$/, '');
  const subjects = listSubjects();
  const targets = [];

  // Core interactive platform tools
  targets.push({
    title: 'DataDrix Interactive Code Playground',
    url: `${baseUrl}/playground`,
    subject: 'all',
    type: 'tool',
    defaultAnchor: 'interactive code playground'
  });

  targets.push({
    title: 'DataDrix Practice & Coding Challenges',
    url: `${baseUrl}/practice`,
    subject: 'all',
    type: 'tool',
    defaultAnchor: 'practical hands-on coding challenges'
  });

  targets.push({
    title: 'Technical Interview Preparation Vault',
    url: `${baseUrl}/interview-prep`,
    subject: 'all',
    type: 'tool',
    defaultAnchor: 'tech interview preparation guide'
  });

  // Subjects and actual lessons
  for (const s of subjects) {
    const subjectUrl = `${baseUrl}/${s.slug}`;
    targets.push({
      title: `${s.title} Curriculum Overview`,
      url: subjectUrl,
      subject: s.slug,
      type: 'subject',
      defaultAnchor: `complete ${s.title} curriculum on DataDrix`
    });

    try {
      const tree = buildSubjectTree(s.slug);
      if (tree && tree.sections) {
        for (const sec of tree.sections) {
          for (const l of (sec.lessons || []).slice(0, 3)) { // pick top lessons
            targets.push({
              title: `${l.title} (${s.title})`,
              url: `${baseUrl}/${s.slug}/${l.slug}`,
              subject: s.slug,
              type: 'lesson',
              defaultAnchor: `tutorial on ${l.title.toLowerCase()}`
            });
          }
        }
      }
    } catch (e) {}
  }

  return targets;
}

/**
 * Uniqueness & Duplicate Checker Service
 * Evaluates proposed content against all existing BlogPosts in MongoDB
 */
async function checkContentUniqueness(contentMarkdown, excludePostId = null) {
  const query = excludePostId ? { _id: { $ne: excludePostId } } : {};
  const existingPosts = await BlogPost.find(query).select('title slug contentMarkdown contentHash');

  if (existingPosts.length === 0) {
    return {
      uniquenessScore: 100,
      highestSimilarityPercent: 0,
      matchedPost: null,
      isDuplicate: false,
      hash: crypto.createHash('sha256').update(normalizeContentForHash(contentMarkdown)).digest('hex')
    };
  }

  const newHash = crypto.createHash('sha256').update(normalizeContentForHash(contentMarkdown)).digest('hex');
  const newTrigrams = getTrigrams(contentMarkdown);

  let highestSimilarity = 0;
  let mostSimilarPost = null;

  for (const post of existingPosts) {
    // Exact hash collision check
    if (post.contentHash === newHash) {
      return {
        uniquenessScore: 0,
        highestSimilarityPercent: 100,
        matchedPost: { id: post._id, title: post.title, slug: post.slug },
        isDuplicate: true,
        hash: newHash
      };
    }

    const postTrigrams = getTrigrams(post.contentMarkdown || '');
    const sim = calculateJaccardSimilarity(newTrigrams, postTrigrams);

    if (sim > highestSimilarity) {
      highestSimilarity = sim;
      mostSimilarPost = { id: post._id, title: post.title, slug: post.slug };
    }
  }

  const roundedSim = Math.round(highestSimilarity * 10) / 10;
  const uniquenessScore = Math.max(0, Math.min(100, Math.round(100 - roundedSim)));

  return {
    uniquenessScore,
    highestSimilarityPercent: roundedSim,
    matchedPost: mostSimilarPost,
    isDuplicate: roundedSim >= 75,
    hash: newHash
  };
}

/**
 * Generate blog post using Free Smart Algorithmic Multi-Variant Template Engine
 */
function generateSmartTemplateArticle(subjectSlug, options = {}) {
  const meta = SUBJECT_METADATA[subjectSlug] || {
    name: subjectSlug.toUpperCase(),
    category: 'Computer Science & Software Engineering',
    keywords: [`${subjectSlug} tutorial`, `learn ${subjectSlug}`, `${subjectSlug} guide`],
    anchors: [`DataDrix ${subjectSlug} course`, `comprehensive ${subjectSlug} tutorial`],
    codeSnippet: `// Sample practical code for ${subjectSlug}\nconsole.log("Mastering ${subjectSlug} with DataDrix!");`
  };

  const websiteBaseUrl = (options.websiteBaseUrl || 'http://localhost:3000').replace(/\/$/, '');
  const subjectName = meta.name;
  const timestampSeed = Date.now();

  // Rotate between distinct content angles to ensure zero repetitive structure
  const ANGLES = [
    {
      angle: 'production-playbook',
      titlePrefix: `The Complete ${subjectName} Production Playbook: Architecture, Patterns & Best Practices`,
      hook: `Writing code that works in isolation is relatively straightforward. Engineering systems with **${subjectName}** that thrive under production traffic, maintain clean separation of concerns, and minimize latency requires a disciplined architectural mindset.`,
      focusH2: `Architecting Scalable ${subjectName} Solutions`
    },
    {
      angle: 'developer-deep-dive',
      titlePrefix: `Mastering ${subjectName} in 2026: The Comprehensive Deep Dive & Technical Blueprint`,
      hook: `In modern software stacks, **${subjectName}** stands out as a bedrock discipline. Whether you are transforming raw telemetry into business intelligence or building high-throughput microservices, understanding foundational internals separates average coders from elite systems architects.`,
      focusH2: `Internals & Core Mechanical Sympathy in ${subjectName}`
    },
    {
      angle: 'hands-on-tutorial',
      titlePrefix: `${subjectName} Demystified: Practical Hands-On Implementation Guide with Real Code`,
      hook: `Tutorial paralysis is one of the most common hurdles engineers face. The fastest antidote is diving straight into real-world code implementation with **${subjectName}**, observing how data flows, and structuring maintainable logic from day one.`,
      focusH2: `Step-by-Step Hands-on Implementation`
    },
    {
      angle: 'pitfalls-and-optimization',
      titlePrefix: `Top 7 Costly ${subjectName} Mistakes Engineers Make (And How to Fix Them Fast)`,
      hook: `Every framework and language carries subtle traps: unintended memory leaks, inefficient query loops, unindexed joins, or anti-pattern abstractions. In **${subjectName}**, resolving these antipatterns early saves countless hours of profiling and debugging down the road.`,
      focusH2: `Diagnosing & Eliminating Common Bottlenecks`
    }
  ];

  const selectedAngle = ANGLES[timestampSeed % ANGLES.length];
  const primaryKeyword = meta.keywords[0];
  const secondaryKeywords = meta.keywords.slice(1, 4);

  // Build natural, context-rich backlink targets
  const subjectUrl = `${websiteBaseUrl}/${subjectSlug}`;
  const playgroundUrl = `${websiteBaseUrl}/playground`;
  const practiceUrl = `${websiteBaseUrl}/practice`;

  const backlinks = [
    {
      anchorText: `explore the complete ${subjectName} learning path at DataDrix`,
      targetUrl: subjectUrl,
      targetSubject: subjectSlug,
      rel: 'dofollow'
    },
    {
      anchorText: `interactive online coding playground`,
      targetUrl: playgroundUrl,
      targetSubject: 'all',
      rel: 'dofollow'
    },
    {
      anchorText: `curated ${subjectName} practice challenges`,
      targetUrl: practiceUrl,
      targetSubject: subjectSlug,
      rel: 'dofollow'
    }
  ];

  const markdown = `# ${selectedAngle.titlePrefix}

> **Executive Summary:** Modern engineering demands rigorous command over foundational concepts. This comprehensive technical guide unpacks essential patterns, practical implementations, and industry-standard workflows for **${subjectName}**, complete with runnable code examples and actionable takeaways.

---

## 1. Introduction: Why ${subjectName} Matters in Modern Systems

${selectedAngle.hook}

As engineering ecosystems grow in complexity, teams that adopt streamlined practices around ${subjectName} consistently report:
- **Faster execution velocity** with predictable, testable modules.
- **Lower operational overhead** via robust error handling and defensive programming patterns.
- **Improved developer onboarding** thanks to readable, declarative code structures.

To accelerate your mastery with interactive verification, you can [${backlinks[0].anchorText}](${backlinks[0].targetUrl}) to step through guided code modules with real-time feedback.

---

## 2. ${selectedAngle.focusH2}

When setting up your engineering workflow, clean abstraction boundaries prevent tight coupling. Consider how state and processing are partitioned.

### Core Architecture Principles
1. **Idempotence & Predictability:** Ensure functions produce deterministic output given identical inputs.
2. **Defensive Validation:** Never assume external inputs adhere to your expected schema; sanitize and validate upfront.
3. **Observability:** Integrate structured logs and performance markers so downstream anomalies can be traced in seconds.

Here is a battle-tested implementation illustrating these principles in practice:

\`\`\`${subjectSlug === 'sql' ? 'sql' : 'python'}
${meta.codeSnippet}
\`\`\`

You can experiment directly with variations of this logic using the [${backlinks[1].anchorText}](${backlinks[1].targetUrl}) directly in your browser without local runtime overhead.

---

## 3. Production Best Practices & Benchmarks

Applying these strategies yields tangible benefits across developer teams:

| Optimization Area | Traditional Approach | Modern ${subjectName} Standard | Impact |
| :--- | :--- | :--- | :--- |
| **Data Processing** | Imperative loops | Vectorized & Pipeline ops | **5x - 20x speedup** |
| **Error Handling** | Silent fails / broad catches | Strict typed exception handling | **99.9% fault isolation** |
| **Testing** | Manual ad-hoc checks | Automated regression suites | **Zero regressions** |
| **Knowledge Transfer** | Static documentation | Interactive self-paced platforms | **Accelerated onboarding** |

---

## 4. Practical Engineering Exercises

To cement these concepts into intuitive muscle memory, engineers should solve targeted algorithmic and structural challenges regularly. Tackling [${backlinks[2].anchorText}](${backlinks[2].targetUrl}) helps identify edge cases such as empty datasets, race conditions, and boundary values before code reaches customer-facing environments.

### Key Takeaway Checklist
- [x] Establish strict input boundaries and contracts.
- [x] Benchmark memory footprints and runtime complexity ($O(n)$ vs $O(n^2)$).
- [x] Document nuances and maintain an active knowledge repository.
- [x] Leverage community-validated learning resources to stay ahead of evolving standards.

---

## 5. Frequently Asked Questions (FAQ)

### What is the most effective way to learn ${subjectName} from scratch?
Start with bite-sized, hands-on coding exercises rather than passively watching video playlists. Platforms like DataDrix combine structured lesson theory with an integrated compiler and live problem-solver so you validate your understanding immediately after reading each module.

### How do I prevent duplicate logic across multiple ${subjectName} services?
Modularize shared logic into internal packages or shared utility modules with clear semantic versioning. Maintain clean interfaces and write unit tests that verify contract adherence.

---

*Published by DataDrix Learning Systems • Empowering software engineers and data practitioners worldwide.*
`;

  const metaDescription = `Master ${subjectName} with this comprehensive technical guide. Explore architecture patterns, practical code snippets, best practices, and interactive tutorials.`.slice(0, 160);

  const wordCount = markdown.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  return {
    title: selectedAngle.titlePrefix,
    metaDescription,
    targetKeywords: [primaryKeyword, ...secondaryKeywords],
    secondaryKeywords,
    targetSubject: subjectSlug,
    topicAngle: selectedAngle.angle,
    contentMarkdown: markdown,
    contentHtml: marked.parse(markdown),
    wordCount,
    readingTimeMinutes,
    backlinks,
    generationSource: 'smart_template'
  };
}

/**
 * Generate blog post using Free Google Gemini AI Engine
 */
async function generateGeminiArticle(subjectSlug, apiKey, modelName = 'gemini-1.5-flash', options = {}) {
  const meta = SUBJECT_METADATA[subjectSlug] || {
    name: subjectSlug,
    keywords: [`${subjectSlug} tutorial`, `learn ${subjectSlug}`]
  };

  const websiteBaseUrl = (options.websiteBaseUrl || 'http://localhost:3000').replace(/\/$/, '');
  const subjectName = meta.name;

  const targetUrl1 = `${websiteBaseUrl}/${subjectSlug}`;
  const targetUrl2 = `${websiteBaseUrl}/playground`;
  const targetUrl3 = `${websiteBaseUrl}/practice`;

  const prompt = `You are a world-class technical writer and senior SEO specialist writing for DataDrix (a premier computer science and data academy).
Write an original, in-depth, captivating, high-ranking SEO blog post (approx 1200 - 1600 words) about: "${subjectName}".

MANDATORY SPECIFICATIONS:
1. TARGET AUDIENCE: Developers, data engineers, students, and tech professionals looking for practical, actionable knowledge.
2. SEO FORMATTING:
   - Provide an H1 title that is high-CTR, modern, and SEO-optimized.
   - Include an executive summary / callout box at the start.
   - Use structured H2 and H3 headings.
   - Include at least 2 clean, production-ready, runnable code blocks with syntax comments.
   - Include a comparison or benchmark markdown table.
   - Include a comprehensive FAQ section with at least 2 common developer questions.
3. ORGANIC BACKLINK INTEGRATION:
   Naturally weave these exact 3 links into the body paragraphs using conversational, high-authority anchor text (do not use generic anchors like "click here"):
   - Link 1: URL "${targetUrl1}" (Anchor should naturally refer to the comprehensive ${subjectName} curriculum or course at DataDrix)
   - Link 2: URL "${targetUrl2}" (Anchor should refer to DataDrix's interactive code playground)
   - Link 3: URL "${targetUrl3}" (Anchor should refer to DataDrix's hands-on practice problems and challenges)
4. TONE & STYLE: Highly informative, professional, developer-friendly, zero fluff, zero clichés.
5. NO DUPLICATE CONTENT: Ensure the phrasing, examples, and structure are completely original.

Output ONLY valid Markdown. Do not include extra conversational banter before or after the markdown.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 4096
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini returned an empty or invalid response.');
  }

  // Extract title from first H1 line if present
  let title = `${subjectName} Masterclass: The Modern Developer's Guide`;
  const h1Match = rawText.match(/^#\s+(.+)$/m);
  if (h1Match) {
    title = h1Match[1].replace(/[\*\_]/g, '').trim();
  }

  const metaDescription = `In-depth technical guide to ${subjectName}. Learn core principles, production code patterns, optimizations, and interactive practices.`.slice(0, 160);
  const wordCount = rawText.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  const backlinks = [
    { anchorText: `DataDrix ${subjectName} curriculum`, targetUrl: targetUrl1, targetSubject: subjectSlug, rel: 'dofollow' },
    { anchorText: `interactive code playground`, targetUrl: targetUrl2, targetSubject: 'all', rel: 'dofollow' },
    { anchorText: `hands-on coding challenges`, targetUrl: targetUrl3, targetSubject: subjectSlug, rel: 'dofollow' }
  ];

  return {
    title,
    metaDescription,
    targetKeywords: meta.keywords || [`${subjectSlug} tutorial`, `learn ${subjectSlug}`],
    secondaryKeywords: (meta.keywords || []).slice(1),
    targetSubject: subjectSlug,
    topicAngle: 'gemini-ai-guide',
    contentMarkdown: rawText,
    contentHtml: marked.parse(rawText),
    wordCount,
    readingTimeMinutes,
    backlinks,
    generationSource: 'ai_gemini'
  };
}

/**
 * Unified Blog Generation Dispatcher
 * Checks settings, invokes appropriate engine, verifies uniqueness against existing posts,
 * and retries or adjusts if duplicate similarity threshold is exceeded.
 */
async function generateUniqueBlogPost(subjectSlug, customOptions = {}) {
  const settings = await SeoSettings.getSettings();
  const websiteBaseUrl = customOptions.websiteBaseUrl || settings.websiteBaseUrl || 'http://localhost:3000';

  let articleData;
  const useGemini = (customOptions.forceProvider === 'gemini' || settings.aiEngine?.provider === 'gemini') && (settings.aiEngine?.geminiApiKey || customOptions.geminiApiKey);

  if (useGemini) {
    const apiKey = customOptions.geminiApiKey || settings.aiEngine.geminiApiKey;
    const model = settings.aiEngine.modelName || 'gemini-1.5-flash';
    try {
      articleData = await generateGeminiArticle(subjectSlug, apiKey, model, { websiteBaseUrl });
    } catch (err) {
      console.warn(`[SEO Generator] Gemini API failed (${err.message}). Gracefully falling back to Smart Template engine.`);
      articleData = generateSmartTemplateArticle(subjectSlug, { websiteBaseUrl });
    }
  } else {
    articleData = generateSmartTemplateArticle(subjectSlug, { websiteBaseUrl });
  }

  // Check uniqueness against existing database posts
  const uniquenessResult = await checkContentUniqueness(articleData.contentMarkdown);

  // If duplicate threshold exceeded and using template, generate alternative angle
  if (uniquenessResult.isDuplicate && articleData.generationSource === 'smart_template') {
    // Regenerate with a randomized angle
    const altSeedOptions = { websiteBaseUrl, seedOffset: Math.floor(Math.random() * 50) + 1 };
    articleData = generateSmartTemplateArticle(subjectSlug, altSeedOptions);
  }

  const slug = `${slugify(articleData.title)}-${Date.now().toString(36).slice(-4)}`;
  const canonicalUrl = `${websiteBaseUrl.replace(/\/$/, '')}/${subjectSlug}`;

  return {
    ...articleData,
    slug,
    canonicalUrl,
    uniquenessScore: uniquenessResult.uniquenessScore,
    contentHash: uniquenessResult.hash,
    duplicateCheck: uniquenessResult
  };
}

module.exports = {
  generateUniqueBlogPost,
  generateSmartTemplateArticle,
  generateGeminiArticle,
  checkContentUniqueness,
  getAvailableBacklinkTargets,
  SUBJECT_METADATA
};

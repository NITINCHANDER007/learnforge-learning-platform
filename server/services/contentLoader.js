const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { Marked } = require('marked');
const { markedHighlight } = require('marked-highlight');
const hljs = require('highlight.js');

const CONTENT_DIR = process.env.CONTENT_DIR
  ? path.resolve(__dirname, '..', process.env.CONTENT_DIR)
  : path.resolve(__dirname, '../../content');

// Configure marked with highlight.js
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

marked.setOptions({
  gfm: true,
  breaks: true
});

const SUBJECT_ICONS = {
  python: '🐍',
  sql: '🗄️',
  html: '🌐',
  css: '🎨',
  javascript: '⚡',
  flask: '🌶️',
  pandas: '🐼',
  numpy: '🔢',
  'machine-learning': '🤖',
  'data-visualization': '📊',
  'power-bi': '📈',
  excel: '📑',
  'web-scraping': '🕷️',
  'file-handling': '📁'
};

const _ORDER_PREFIX_PATTERN = /^\d+-/;

function stripOrderPrefix(str) {
  return str.replace(_ORDER_PREFIX_PATTERN, '');
}

/**
 * Enumerate every subject present in content/
 */
function listSubjects() {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
  const subjects = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const subjectDir = path.join(CONTENT_DIR, entry.name);
    const subjectJsonPath = path.join(subjectDir, 'subject.json');

    if (!fs.existsSync(subjectJsonPath)) continue;

    try {
      const metadata = JSON.parse(fs.readFileSync(subjectJsonPath, 'utf8'));
      const order = metadata.order !== undefined && !isNaN(Number(metadata.order))
        ? Number(metadata.order)
        : 9999;

      subjects.push({
        slug: entry.name,
        title: metadata.title || entry.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: metadata.description || '',
        order,
        icon: SUBJECT_ICONS[entry.name] || '📚'
      });
    } catch (e) {
      console.warn(`Error reading ${subjectJsonPath}:`, e.message);
    }
  }

  subjects.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));

  return subjects.map(({ slug, title, description, icon }) => ({
    slug,
    title,
    description,
    icon
  }));
}

/**
 * Builds tree of sections and lessons for a given subject.
 */
function buildSubjectTree(subjectSlug) {
  const subjectDir = path.join(CONTENT_DIR, subjectSlug);
  if (!fs.existsSync(subjectDir)) return null;

  const subjectJsonPath = path.join(subjectDir, 'subject.json');
  let subjectTitle = subjectSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  let subjectDescription = '';

  if (fs.existsSync(subjectJsonPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(subjectJsonPath, 'utf8'));
      if (meta.title) subjectTitle = meta.title;
      if (meta.description) subjectDescription = meta.description;
    } catch (e) {}
  }

  const entries = fs.readdirSync(subjectDir, { withFileTypes: true });
  const sectionCandidates = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

    const sectionDir = path.join(subjectDir, entry.name);
    const sectionJsonPath = path.join(sectionDir, 'section.json');

    let sectionTitle = stripOrderPrefix(entry.name).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    let sectionOrder = 9999;

    if (fs.existsSync(sectionJsonPath)) {
      try {
        const secMeta = JSON.parse(fs.readFileSync(sectionJsonPath, 'utf8'));
        if (secMeta.title) sectionTitle = secMeta.title;
        if (secMeta.order !== undefined && !isNaN(Number(secMeta.order))) {
          sectionOrder = Number(secMeta.order);
        }
      } catch (e) {}
    }

    // Read lessons in section
    const files = fs.readdirSync(sectionDir, { withFileTypes: true });
    const lessonCandidates = [];

    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith('.md')) continue;

      const filePath = path.join(sectionDir, file.name);
      try {
        const rawContent = fs.readFileSync(filePath, 'utf8');
        const parsed = matter(rawContent);

        const filenameStem = path.basename(file.name, '.md');
        const lessonSlug = stripOrderPrefix(filenameStem);
        const lessonTitle = (parsed.data && parsed.data.title) ||
          lessonSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const lessonOrder = (parsed.data && parsed.data.order !== undefined && !isNaN(Number(parsed.data.order)))
          ? Number(parsed.data.order)
          : 9999;

        lessonCandidates.push({
          slug: lessonSlug,
          title: lessonTitle,
          order: lessonOrder,
          filename: file.name,
          sectionFolder: entry.name
        });
      } catch (e) {
        console.warn(`Error reading lesson ${filePath}:`, e.message);
      }
    }

    lessonCandidates.sort((a, b) => a.order - b.order || a.filename.localeCompare(b.filename));

    const lessons = lessonCandidates.map(({ slug, title, filename, sectionFolder }) => ({
      slug,
      title,
      filename,
      sectionFolder,
      path: `${subjectSlug}/${slug}`
    }));

    sectionCandidates.push({
      slug: stripOrderPrefix(entry.name),
      folder: entry.name,
      title: sectionTitle,
      order: sectionOrder,
      lessons
    });
  }

  sectionCandidates.sort((a, b) => a.order - b.order || a.folder.localeCompare(b.folder));

  return {
    slug: subjectSlug,
    title: subjectTitle,
    description: subjectDescription,
    icon: SUBJECT_ICONS[subjectSlug] || '📚',
    sections: sectionCandidates
  };
}

/**
 * Returns the first lesson slug for a given subject.
 */
function getFirstLessonSlug(subjectSlug) {
  const tree = buildSubjectTree(subjectSlug);
  if (!tree || !tree.sections) return null;
  for (const sec of tree.sections) {
    if (sec.lessons && sec.lessons.length > 0) {
      return sec.lessons[0].slug;
    }
  }
  return null;
}

/**
 * Rewrites relative media paths in markdown to API routes.
 */
function rewriteMediaUrls(content, subjectSlug, sectionFolder) {
  // Replaces patterns like ![alt](./media/file.png) or ![](image.png)
  return content.replace(/!\[([^\]]*)\]\((?!https?:\/\/|\/api\/)([^)]+)\)/g, (match, alt, relPath) => {
    const cleanPath = relPath.replace(/^\.?\//, '');
    return `![${alt}](/api/content-media/${subjectSlug}/${sectionFolder}/${cleanPath})`;
  });
}

/**
 * Loads a single lesson by subjectSlug and lessonSlug.
 */
function loadLesson(subjectSlug, lessonSlug) {
  const tree = buildSubjectTree(subjectSlug);
  if (!tree) throw new Error(`Subject '${subjectSlug}' not found.`);

  let targetLesson = null;
  let targetSection = null;

  for (const sec of tree.sections) {
    const found = sec.lessons.find(l => l.slug === lessonSlug);
    if (found) {
      targetLesson = found;
      targetSection = sec;
      break;
    }
  }

  if (!targetLesson) {
    throw new Error(`Lesson '${lessonSlug}' not found in subject '${subjectSlug}'.`);
  }

  const filePath = path.join(CONTENT_DIR, subjectSlug, targetSection.folder, targetLesson.filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Lesson file '${filePath}' does not exist.`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);

  const rawBody = parsed.content || '';
  const rewrittenBody = rewriteMediaUrls(rawBody, subjectSlug, targetSection.folder);
  const bodyHtml = marked.parse(rewrittenBody);

  return {
    subjectSlug,
    lessonSlug,
    title: targetLesson.title,
    bodyHtml,
    rawMarkdown: rawBody,
    sectionFolder: targetSection.folder,
    sectionTitle: targetSection.title,
    path: `${subjectSlug}/${lessonSlug}`
  };
}

/**
 * Full-text search across all subjects and lessons.
 */
function searchLessons(q) {
  if (!q || !q.trim()) return [];

  const query = q.toLowerCase().trim();
  const subjects = listSubjects();
  const results = [];

  for (const subject of subjects) {
    const tree = buildSubjectTree(subject.slug);
    if (!tree) continue;

    for (const section of tree.sections) {
      for (const lesson of section.lessons) {
        const filePath = path.join(CONTENT_DIR, subject.slug, section.folder, lesson.filename);
        if (!fs.existsSync(filePath)) continue;

        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          const parsed = matter(raw);
          const body = (parsed.content || '').toLowerCase();
          const title = (lesson.title || '').toLowerCase();

          if (title.includes(query) || body.includes(query)) {
            let snippet = '';
            const matchIndex = body.indexOf(query);
            if (matchIndex !== -1) {
              const start = Math.max(0, matchIndex - 60);
              const end = Math.min(body.length, matchIndex + query.length + 60);
              snippet = (start > 0 ? '...' : '') +
                parsed.content.substring(start, end).replace(/\n/g, ' ') +
                (end < body.length ? '...' : '');
            } else {
              snippet = parsed.content.substring(0, 120).replace(/\n/g, ' ') + '...';
            }

            results.push({
              subjectSlug: subject.slug,
              subjectTitle: subject.title,
              lessonSlug: lesson.slug,
              lessonTitle: lesson.title,
              snippet,
              url: `/${subject.slug}/${lesson.slug}`
            });
          }
        } catch (e) {}
      }
    }
  }

  return results;
}

module.exports = {
  CONTENT_DIR,
  SUBJECT_ICONS,
  listSubjects,
  buildSubjectTree,
  getFirstLessonSlug,
  loadLesson,
  searchLessons
};

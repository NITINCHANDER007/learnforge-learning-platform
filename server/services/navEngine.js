/**
 * navEngine.js
 * Computes Previous/Next navigation, current position, and total lesson count.
 */

function buildNavMap(subjectTree) {
  if (!subjectTree || !subjectTree.sections) {
    return {};
  }

  const flatLessons = [];
  for (const section of subjectTree.sections) {
    if (section.lessons) {
      for (const lesson of section.lessons) {
        flatLessons.push(lesson);
      }
    }
  }

  const total = flatLessons.length;
  const navMap = {};

  for (let i = 0; i < total; i++) {
    const lesson = flatLessons[i];
    navMap[lesson.slug] = {
      previous: i > 0 ? { slug: flatLessons[i - 1].slug, title: flatLessons[i - 1].title } : null,
      next: i < total - 1 ? { slug: flatLessons[i + 1].slug, title: flatLessons[i + 1].title } : null,
      position: i + 1,
      total
    };
  }

  return navMap;
}

function getLessonNav(subjectTree, lessonSlug) {
  const navMap = buildNavMap(subjectTree);
  return navMap[lessonSlug] || null;
}

module.exports = {
  buildNavMap,
  getLessonNav
};

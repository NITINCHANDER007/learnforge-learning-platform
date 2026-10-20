const rawBase = import.meta.env.VITE_API_URL || '';
const API_BASE = rawBase ? (rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/$/, '')}/api`) : '/api';

function getHeaders(customHeaders = {}) {
  const token = localStorage.getItem('learnforge_token') || localStorage.getItem('datadrix_token');
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const isFormData = options.body instanceof FormData;
  const token = localStorage.getItem('learnforge_token') || localStorage.getItem('datadrix_token');

  const headers = isFormData
    ? { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    : getHeaders(options.headers);

  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({ success: false, message: 'Server returned invalid response' }));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  forgotPassword: (identifier) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ identifier }) }),
  verifyResetToken: (token) => request(`/auth/verify-reset-token/${token}`),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  getRecentNotifications: () => request('/auth/recent-notifications'),

  // Content
  getSubjects: () => request('/content/subjects'),
  getSubjectTree: (subjectSlug) => request(`/content/subjects/${subjectSlug}`),
  getFirstLesson: (subjectSlug) => request(`/content/subjects/${subjectSlug}/first`),
  getLesson: (subjectSlug, lessonSlug) => request(`/content/subjects/${subjectSlug}/lessons/${lessonSlug}`),
  searchLessons: (q) => request(`/content/search?q=${encodeURIComponent(q)}`),

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),
  getBookmarks: () => request('/dashboard/bookmarks'),
  toggleBookmark: (subjectSlug, lessonSlug) =>
    request('/dashboard/bookmarks/toggle', { method: 'POST', body: JSON.stringify({ subjectSlug, lessonSlug }) }),
  toggleProgress: (subjectSlug, lessonSlug) =>
    request('/dashboard/progress/toggle', { method: 'POST', body: JSON.stringify({ subjectSlug, lessonSlug }) }),
  getNotes: () => request('/dashboard/notes'),
  createNote: (formData) => request('/dashboard/notes', { method: 'POST', body: formData }),
  updateNote: (id, formData) => request(`/dashboard/notes/${id}`, { method: 'PUT', body: formData }),
  deleteNote: (id) => request(`/dashboard/notes/${id}`, { method: 'DELETE' }),
  updateProfile: (body) => request('/dashboard/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) => request('/dashboard/password', { method: 'PUT', body: JSON.stringify(body) }),
  exportData: () => request('/dashboard/export'),
  importData: (payload) => request('/dashboard/import', { method: 'POST', body: JSON.stringify(payload) }),
  getCertificate: (subjectSlug) => request(`/dashboard/certificate/${subjectSlug}`),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: (params = '') => request(`/admin/users${params}`),
  getUserProgress: (userId) => request(`/admin/users/${userId}/progress`),
  createAdminUser: (body) => request('/admin/users', { method: 'POST', body: JSON.stringify(body) }),
  updateUserRoleStatus: (id, body) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAdminUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  resetAdminUserPassword: (id, newPassword) => request(`/admin/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) }),
  getAdminNotifications: () => request('/admin/notifications'),
  blockAdminUser: (id, body = {}) => request(`/admin/users/${id}/block`, { method: 'PUT', body: JSON.stringify(body) }),
  getDatabaseStatus: () => request('/admin/database/status'),
  testDatabaseConnection: (uri) => request('/admin/database/test-connection', { method: 'POST', body: JSON.stringify({ uri }) }),
  reconnectDatabase: (uri) => request('/admin/database/reconnect', { method: 'POST', body: JSON.stringify({ uri }) }),
  pingDatabase: () => request('/admin/database/ping', { method: 'POST' }),
  getLessonNotes: () => request('/admin/lesson-notes'),
  createLessonNote: (body) => request('/admin/lesson-notes', { method: 'POST', body: JSON.stringify(body) }),
  updateLessonNote: (id, body) => request(`/admin/lesson-notes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteLessonNote: (id) => request(`/admin/lesson-notes/${id}`, { method: 'DELETE' }),

  // Compiler / Code Execution
  executeCode: (body) => request('/compiler/run', { method: 'POST', body: JSON.stringify(body) }),
  getCompilerStatus: () => request('/compiler/status'),

  // Automated SEO Backlink Blog System
  getSeoStats: () => request('/seo/stats'),
  getSeoPosts: (params = '') => request(`/seo/posts${params}`),
  getSeoPost: (id) => request(`/seo/posts/${id}`),
  generateSeoPost: (body) => request('/seo/posts/generate', { method: 'POST', body: JSON.stringify(body) }),
  createSeoPost: (body) => request('/seo/posts', { method: 'POST', body: JSON.stringify(body) }),
  updateSeoPost: (id, body) => request(`/seo/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSeoPost: (id) => request(`/seo/posts/${id}`, { method: 'DELETE' }),
  publishSeoPost: (id, body) => request(`/seo/posts/${id}/publish`, { method: 'POST', body: JSON.stringify(body) }),
  checkSeoPostUniqueness: (id) => request(`/seo/posts/${id}/check-uniqueness`, { method: 'POST' }),
  getSeoSettings: () => request('/seo/settings'),
  updateSeoSettings: (body) => request('/seo/settings', { method: 'PUT', body: JSON.stringify(body) }),
  testSeoPlatformConnection: (platform, body = {}) => request(`/seo/settings/test-connection/${platform}`, { method: 'POST', body: JSON.stringify(body) }),
  triggerSeoAutoPilot: () => request('/seo/autopilot/trigger', { method: 'POST' }),
  getSeoSubjectsAndLessons: () => request('/seo/subjects-and-lessons'),
  getGoogleAppsScriptCode: () => request('/seo/google-apps-script-code'),
  getSeoManualPayloads: (id) => request(`/seo/posts/${id}/manual-payloads`)
};


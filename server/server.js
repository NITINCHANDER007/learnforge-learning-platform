const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

// Connect to MongoDB
connectDB().then(async () => {
  // Ensure default admin user exists
  try {
    const adminEmail = 'admin@datadrix.com';
    const admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: 'adminpassword123',
        role: 'admin',
        isActive: true
      });
      console.log(`[DataDrix] Seeded default admin: ${adminEmail} / adminpassword123`);
    }
  } catch (e) {
    console.warn('[DataDrix] Admin seed check warning:', e.message);
  }

  // Initialize SEO Backlink Auto-Pilot Scheduler
  try {
    const { initializeAutoPilotScheduler } = require('./services/autoPilotService');
    await initializeAutoPilotScheduler();
  } catch (e) {
    console.warn('[DataDrix] SEO Scheduler startup warning:', e.message);
  }
});

const app = express();

// Middlewares
app.use(cors({
  origin: true, // Reflect request origin to support credentials in production
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
const uploadsDir = path.resolve(__dirname, process.env.UPLOADS_DIR || '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Content Media handler (images, downloads, videos alongside markdown)
const contentDir = process.env.CONTENT_DIR
  ? path.resolve(__dirname, process.env.CONTENT_DIR)
  : path.resolve(__dirname, '../../content');

const ALLOWED_MEDIA = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'mp4', 'webm', 'pdf', 'zip']);

app.get('/api/content-media/:subjectSlug/:sectionFolder/:filename', (req, res) => {
  const { subjectSlug, sectionFolder, filename } = req.params;
  const ext = path.extname(filename).toLowerCase().replace('.', '');

  if (!ALLOWED_MEDIA.has(ext)) {
    return res.status(403).json({ error: 'Forbidden file extension' });
  }

  const filePath = path.join(contentDir, subjectSlug, sectionFolder, filename);

  // Path traversal check
  if (!filePath.startsWith(contentDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Media file not found' });
  }

  res.sendFile(filePath);
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/content', require('./routes/content'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/compiler', require('./routes/compiler'));
app.use('/api/seo', require('./routes/seo'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  let pingMs = null;
  if (isDbConnected && mongoose.connection.db) {
    try {
      const t0 = Date.now();
      await mongoose.connection.db.admin().ping();
      pingMs = Date.now() - t0;
    } catch (e) {}
  }

  res.json({
    status: isDbConnected ? 'ok' : 'degraded',
    platform: 'DataDrix MERN Platform',
    database: {
      status: isDbConnected ? 'connected' : 'disconnected',
      name: mongoose.connection.name || 'datadrix',
      host: mongoose.connection.host ? `${mongoose.connection.host}:${mongoose.connection.port || 27017}` : '127.0.0.1:27017',
      latency: pingMs !== null ? `${pingMs}ms` : 'N/A'
    },
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString()
  });
});

// Catch-all for undefined API endpoints (prevents returning HTML for API requests)
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Serve frontend in production
const clientDist = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
=============================================================
   [DataDrix MERN] Express & MongoDB Server Active
   URL:         http://localhost:${PORT}
   Database:    MongoDB (datadrix)
   API:         http://localhost:${PORT}/api
   Admin Login: admin@datadrix.com / adminpassword123
=============================================================
`);
});

const mongoose = require('mongoose');

const AutoPilotLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  action: {
    type: String,
    enum: ['generate', 'publish', 'cycle', 'error'],
    required: true
  },
  subject: String,
  blogPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost'
  },
  blogTitle: String,
  platforms: [String],
  success: Boolean,
  message: String,
  details: mongoose.Schema.Types.Mixed
}, { _id: false });

const SeoSettingsSchema = new mongoose.Schema({
  singletonKey: {
    type: String,
    default: 'GLOBAL_SEO_CONFIG',
    unique: true
  },
  websiteBaseUrl: {
    type: String,
    default: 'http://localhost:3000',
    trim: true
  },
  websiteName: {
    type: String,
    default: 'DataDrix Learning Academy',
    trim: true
  },
  // Auto-Pilot Background Generator & Publisher
  autoPilot: {
    enabled: {
      type: Boolean,
      default: false
    },
    intervalHours: {
      type: Number,
      default: 24, // every 24 hours
      min: 1,
      max: 168
    },
    cronSchedule: {
      type: String,
      default: '0 9 * * *' // 9:00 AM daily
    },
    autoPublish: {
      type: Boolean,
      default: false // if false, saves as draft for review before publishing
    },
    platforms: {
      wordpress: { type: Boolean, default: false },
      medium: { type: Boolean, default: false },
      googleSites: { type: Boolean, default: false }
    },
    targetSubjects: [{
      type: String
    }],
    lastRunAt: {
      type: Date,
      default: null
    },
    nextRunAt: {
      type: Date,
      default: null
    },
    lastStatus: {
      type: String,
      default: 'idle'
    }
  },
  // WordPress REST API (Free, core feature)
  wordpress: {
    enabled: {
      type: Boolean,
      default: false
    },
    siteUrl: {
      type: String,
      default: '',
      trim: true
    },
    username: {
      type: String,
      default: '',
      trim: true
    },
    applicationPassword: {
      type: String,
      default: '',
      trim: true
    },
    defaultStatus: {
      type: String,
      enum: ['draft', 'publish'],
      default: 'draft'
    },
    defaultCategory: {
      type: String,
      default: ''
    },
    lastConnectedAt: Date,
    connectionStatus: {
      type: String,
      enum: ['untested', 'connected', 'error'],
      default: 'untested'
    },
    lastError: String
  },
  // Medium REST API (Free integration token)
  medium: {
    enabled: {
      type: Boolean,
      default: false
    },
    integrationToken: {
      type: String,
      default: '',
      trim: true
    },
    authorId: {
      type: String,
      default: '',
      trim: true
    },
    username: {
      type: String,
      default: '',
      trim: true
    },
    publicationId: {
      type: String,
      default: '',
      trim: true
    },
    defaultStatus: {
      type: String,
      enum: ['draft', 'public', 'unlisted'],
      default: 'draft'
    },
    notifyFollowers: {
      type: Boolean,
      default: false
    },
    lastConnectedAt: Date,
    connectionStatus: {
      type: String,
      enum: ['untested', 'connected', 'error'],
      default: 'untested'
    },
    lastError: String
  },
  // Google Sites Integration (Free Google Apps Script Webhook / Google Drive Sync)
  googleSites: {
    enabled: {
      type: Boolean,
      default: false
    },
    webhookUrl: {
      type: String,
      default: '',
      trim: true
    },
    siteUrl: {
      type: String,
      default: '',
      trim: true
    },
    secretToken: {
      type: String,
      default: 'datadrix-sites-secret-key-2026',
      trim: true
    },
    method: {
      type: String,
      enum: ['apps_script_webhook', 'html_embed'],
      default: 'apps_script_webhook'
    },
    lastConnectedAt: Date,
    connectionStatus: {
      type: String,
      enum: ['untested', 'connected', 'error'],
      default: 'untested'
    },
    lastError: String
  },
  // AI Generation Engine (Smart Engine default + Free Gemini API option)
  aiEngine: {
    provider: {
      type: String,
      enum: ['smart_template', 'gemini'],
      default: 'smart_template'
    },
    geminiApiKey: {
      type: String,
      default: '',
      trim: true
    },
    modelName: {
      type: String,
      default: 'gemini-1.5-flash',
      trim: true
    },
    connectionStatus: {
      type: String,
      enum: ['untested', 'connected', 'error'],
      default: 'untested'
    },
    lastError: String
  },
  // Anti-duplication settings
  antiDuplication: {
    similarityThresholdPercent: {
      type: Number,
      default: 75, // reject or regenerate if >= 75% similarity with existing blog
      min: 50,
      max: 95
    },
    enforceCanonical: {
      type: Boolean,
      default: true // ensures canonical URL tags are included on all platforms
    }
  },
  // Activity / Audit Logs
  activityLogs: [AutoPilotLogSchema]
}, {
  timestamps: true
});

// Helper to get or create settings singleton
SeoSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ singletonKey: 'GLOBAL_SEO_CONFIG' });
  if (!settings) {
    settings = await this.create({ singletonKey: 'GLOBAL_SEO_CONFIG' });
  }
  return settings;
};

module.exports = mongoose.model('SeoSettings', SeoSettingsSchema);

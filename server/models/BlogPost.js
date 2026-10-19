const mongoose = require('mongoose');

const BacklinkSchema = new mongoose.Schema({
  anchorText: {
    type: String,
    required: true,
    trim: true
  },
  targetUrl: {
    type: String,
    required: true,
    trim: true
  },
  targetSubject: {
    type: String,
    trim: true
  },
  rel: {
    type: String,
    default: 'dofollow'
  },
  clicks: {
    type: Number,
    default: 0
  }
}, { _id: false });

const PlatformPublicationSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['not_published', 'pending', 'published', 'failed'],
    default: 'not_published'
  },
  postId: {
    type: String,
    default: null
  },
  url: {
    type: String,
    default: null
  },
  publishedAt: {
    type: Date,
    default: null
  },
  error: {
    type: String,
    default: null
  }
}, { _id: false });

const BlogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  metaDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 320
  },
  targetKeywords: [{
    type: String,
    trim: true
  }],
  secondaryKeywords: [{
    type: String,
    trim: true
  }],
  targetSubject: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  topicAngle: {
    type: String,
    default: 'practical-guide'
  },
  contentMarkdown: {
    type: String,
    required: true
  },
  contentHtml: {
    type: String,
    required: true
  },
  wordCount: {
    type: Number,
    default: 0
  },
  readingTimeMinutes: {
    type: Number,
    default: 1
  },
  backlinks: [BacklinkSchema],
  uniquenessScore: {
    type: Number,
    default: 100, // percentage (0 - 100)
    min: 0,
    max: 100
  },
  contentHash: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'publishing', 'published', 'failed'],
    default: 'draft',
    index: true
  },
  scheduledFor: {
    type: Date,
    default: null
  },
  canonicalUrl: {
    type: String,
    trim: true
  },
  platformPublications: {
    wordpress: {
      type: PlatformPublicationSchema,
      default: () => ({})
    },
    medium: {
      type: PlatformPublicationSchema,
      default: () => ({})
    },
    googleSites: {
      type: PlatformPublicationSchema,
      default: () => ({})
    }
  },
  generationSource: {
    type: String,
    enum: ['ai_gemini', 'smart_template', 'manual'],
    default: 'smart_template'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Helper method to check if published anywhere
BlogPostSchema.virtual('isPublishedAnywhere').get(function() {
  const wp = this.platformPublications?.wordpress?.status === 'published';
  const med = this.platformPublications?.medium?.status === 'published';
  const gs = this.platformPublications?.googleSites?.status === 'published';
  return wp || med || gs;
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);

const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  lessonPath: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

bookmarkSchema.index({ userId: 1, lessonPath: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);

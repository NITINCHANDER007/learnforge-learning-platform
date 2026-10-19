const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
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
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// A user can only have one progress record per lesson
progressSchema.index({ userId: 1, lessonPath: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);

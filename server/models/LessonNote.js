const mongoose = require('mongoose');

const lessonNoteSchema = new mongoose.Schema(
  {
    lessonPath: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    body: {
      type: String,
      default: ''
    },
    attachmentPath: {
      type: String,
      default: null
    },
    published: {
      type: Boolean,
      default: true
    },
    pinned: {
      type: Boolean,
      default: false
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('LessonNote', lessonNoteSchema);

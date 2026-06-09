const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    // Who filed the report
    reporter: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    // What type of content is being reported
    targetType: {
      type: String,
      required: true,
      enum: ['post', 'comment', 'event', 'user'],
    },
    // The ID of the reported content
    targetId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    // The reason for reporting
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the report'],
      enum: [
        'spam',
        'harassment',
        'hate_speech',
        'misinformation',
        'inappropriate_content',
        'self_harm',
        'other',
      ],
    },
    // Optional free-text details
    details: {
      type: String,
      maxlength: [500, 'Details cannot exceed 500 characters'],
      default: '',
    },
    // Status of the report (admin workflow)
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'action_taken', 'dismissed'],
      default: 'pending',
    },
    // Admin who handled the report
    reviewedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    // Admin notes on the action taken
    adminNotes: {
      type: String,
      maxlength: [500, 'Admin notes cannot exceed 500 characters'],
      default: '',
    },
    // College domain isolation
    collegeDomain: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent users from reporting the same content twice
reportSchema.index({ reporter: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);

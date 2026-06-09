const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema(
  {
    // Sender and recipient stored as User IDs — anonymousName shown in UI
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    collegeDomain: {
      type: String,
      required: true,
      index: true,
    },
    // Optional: link to the post that initiated the DM
    originPost: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      default: null,
    },
  },
  { timestamps: true }
);

// Index for fast conversation lookups
directMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
directMessageSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('DirectMessage', directMessageSchema);

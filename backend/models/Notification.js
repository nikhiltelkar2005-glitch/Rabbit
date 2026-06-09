const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'post_reply',       // Someone commented on your post
        'comment_reply',    // Someone replied to your comment
        'post_upvote',      // Your post crossed an upvote milestone
        'badge_earned',     // You earned a new badge
        'event_reminder',   // Event you RSVP'd to is in 24hrs
        'ama_answer',       // Your AMA question was answered
        'dm_received',      // You got a new DM
      ],
    },
    // Human-readable message shown in the UI
    message: {
      type: String,
      required: true,
      maxlength: 200,
    },
    // The thing being referenced (post, comment, event, ama, dm)
    referenceType: {
      type: String,
      enum: ['post', 'comment', 'event', 'ama', 'dm', null],
      default: null,
    },
    referenceId: {
      type: mongoose.Schema.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    collegeDomain: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Index for fast unread count lookups
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

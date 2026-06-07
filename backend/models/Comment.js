const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Please provide comment content'],
      maxlength: [2000, 'Content cannot exceed 2000 characters'],
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment',
      default: null, // If null, it's a top-level comment. If set, it's a reply.
    },
    upvotes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    collegeDomain: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for getting total score
commentSchema.virtual('score').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

module.exports = mongoose.model('Comment', commentSchema);

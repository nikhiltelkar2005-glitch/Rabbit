const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a post title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide post content'],
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    community: {
      type: mongoose.Schema.ObjectId,
      ref: 'Community',
      required: true,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for getting total score
postSchema.virtual('score').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Add text indexes for search
postSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Post', postSchema);

const mongoose = require('mongoose');
const { calculateTrendingScore } = require('../utils/trending.util');


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
    isPoll: {
      type: Boolean,
      default: false,
    },
    pollOptions: [
      {
        optionText: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, 'Poll option cannot exceed 100 characters'],
        },
        votes: {
          type: Number,
          default: 0,
        },
        voters: [
          {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
          },
        ],
      },
    ],
    pollEndsAt: {
      type: Date,
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
    trendingScore: {
      type: Number,
      default: 0,
    },
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
postSchema.virtual('score').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Pre-save hook to calculate trending score
postSchema.pre('save', function(next) {
  this.trendingScore = calculateTrendingScore(this.upvotes.length, this.downvotes.length, this.createdAt);
  next();
});

// Add text indexes for search
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ trendingScore: -1 }); // Index for fast sorting by trending

module.exports = mongoose.model('Post', postSchema);

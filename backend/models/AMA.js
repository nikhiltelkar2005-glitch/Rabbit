const mongoose = require('mongoose');

const amaQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Please provide a question'],
      maxlength: [500, 'Question cannot exceed 500 characters'],
      trim: true,
    },
    asker: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    answer: {
      type: String,
      maxlength: [2000, 'Answer cannot exceed 2000 characters'],
      default: null,
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
    // Upvotes so best questions bubble up for the host to answer
    upvotes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const amaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an AMA title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    host: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    // Context about the host — shown anonymously (e.g. "2024 Grad, SDE at Google")
    hostContext: {
      type: String,
      maxlength: [150, 'Host context cannot exceed 150 characters'],
      default: '',
    },
    collegeDomain: {
      type: String,
      required: true,
      index: true,
    },
    endsAt: {
      type: Date,
      required: [true, 'Please provide an end time for the AMA'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    questions: [amaQuestionSchema],
    // Tags like "placements", "cse", "internship"
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 30,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: is the AMA still open?
amaSchema.virtual('isOpen').get(function () {
  return this.isActive && new Date() < new Date(this.endsAt);
});

// Text search
amaSchema.index({ title: 'text', description: 'text', hostContext: 'text' });

module.exports = mongoose.model('AMA', amaSchema);

const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a community name'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Community name must be at least 3 characters long'],
      maxlength: [30, 'Community name cannot exceed 30 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a community description'],
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    creator: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
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
  }
);

// Add text indexes for search
communitySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Community', communitySchema);

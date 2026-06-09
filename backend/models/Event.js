const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide an event description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    venue: {
      type: String,
      required: [true, 'Please provide a venue'],
      trim: true,
      maxlength: [200, 'Venue cannot exceed 200 characters'],
    },
    eventDate: {
      type: Date,
      required: [true, 'Please provide the event date and time'],
    },
    // The club/organizer name (anonymized label, e.g. "Tech Club")
    clubName: {
      type: String,
      required: [true, 'Please provide the club or organizer name'],
      trim: true,
      maxlength: [80, 'Club name cannot exceed 80 characters'],
    },
    // Which community this event belongs to (optional — events can be college-wide)
    community: {
      type: mongoose.Schema.ObjectId,
      ref: 'Community',
      default: null,
    },
    organizer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    collegeDomain: {
      type: String,
      required: true,
      index: true,
    },
    // RSVP list
    attendees: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    // Tags like "tech", "cultural", "sports", "academic"
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 30,
      },
    ],
    // Whether the event is still open for registration
    isCancelled: {
      type: Boolean,
      default: false,
    },
    maxAttendees: {
      type: Number,
      default: null, // null = unlimited
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: count of RSVPs
eventSchema.virtual('attendeeCount').get(function () {
  return this.attendees.length;
});

// Virtual: is the event upcoming?
eventSchema.virtual('isUpcoming').get(function () {
  return new Date() < new Date(this.eventDate);
});

// Text indexes for search
eventSchema.index({ title: 'text', description: 'text', clubName: 'text' });
eventSchema.index({ eventDate: 1 }); // Fast sort by date

module.exports = mongoose.model('Event', eventSchema);

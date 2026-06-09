const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEventById,
  rsvpEvent,
  cancelEvent,
  getEventsByCommunity,
} = require('../controllers/event.controller');
const { protect } = require('../middleware/auth.middleware');
const { eventLimiter } = require('../middleware/rateLimit');

// GET  /api/events          — list all events (upcoming by default)
// POST /api/events          — create a new event
router.route('/')
  .get(protect, getAllEvents)
  .post(protect, eventLimiter, createEvent);

// GET /api/events/community/:communityId — events for a specific community
router.route('/community/:communityId')
  .get(protect, getEventsByCommunity);

// GET   /api/events/:id        — get single event
// PATCH /api/events/:id/cancel — cancel event (organizer or admin)
router.route('/:id')
  .get(protect, getEventById);

router.route('/:id/rsvp')
  .post(protect, rsvpEvent);

router.route('/:id/cancel')
  .patch(protect, cancelEvent);

module.exports = router;

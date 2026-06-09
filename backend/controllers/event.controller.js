const Event = require('../models/Event');
const Community = require('../models/Community');

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Create a new event
// @route   POST /api/events
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, venue, eventDate, clubName, communityId, tags, maxAttendees } = req.body;

    // Validate that the event date is in the future
    if (new Date(eventDate) <= new Date()) {
      return res.status(400).json({ success: false, message: 'Event date must be in the future.' });
    }

    // If a community is specified, validate it belongs to the same college
    if (communityId) {
      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ success: false, message: 'Community not found.' });
      }
      if (community.collegeDomain !== req.user.collegeDomain) {
        return res.status(403).json({ success: false, message: 'You cannot create an event for a community outside your college.' });
      }
    }

    const event = await Event.create({
      title,
      description,
      venue,
      eventDate,
      clubName,
      community: communityId || null,
      organizer: req.user.id,
      collegeDomain: req.user.collegeDomain,
      tags: tags || [],
      maxAttendees: maxAttendees || null,
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get all events for the user's college (upcoming first)
// @route   GET /api/events
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.getAllEvents = async (req, res, next) => {
  try {
    const { filter, tag } = req.query;

    const query = { collegeDomain: req.user.collegeDomain };

    // filter=upcoming (default), filter=past, filter=all
    if (!filter || filter === 'upcoming') {
      query.eventDate = { $gte: new Date() };
    } else if (filter === 'past') {
      query.eventDate = { $lt: new Date() };
    }

    // Filter by tag if provided
    if (tag) {
      query.tags = tag.toLowerCase();
    }

    const events = await Event.find(query)
      .populate('organizer', 'anonymousName')
      .populate('community', 'name')
      .sort({ eventDate: 1 }); // Soonest events first

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get a single event by ID
// @route   GET /api/events/:id
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'anonymousName')
      .populate('community', 'name')
      .populate('attendees', 'anonymousName');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ success: false, message: 'You cannot view events outside your college.' });
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    RSVP (or un-RSVP) to an event
// @route   POST /api/events/:id/rsvp
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.rsvpEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ success: false, message: 'You cannot RSVP to events outside your college.' });
    }

    if (event.isCancelled) {
      return res.status(400).json({ success: false, message: 'This event has been cancelled.' });
    }

    if (new Date() > new Date(event.eventDate)) {
      return res.status(400).json({ success: false, message: 'This event has already passed.' });
    }

    const userId = req.user.id;
    const alreadyRSVPd = event.attendees.some(id => id.toString() === userId);

    if (alreadyRSVPd) {
      // Un-RSVP
      event.attendees = event.attendees.filter(id => id.toString() !== userId);
      await event.save();
      return res.status(200).json({ success: true, message: 'RSVP removed.', data: event });
    }

    // Check capacity
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ success: false, message: 'This event is at full capacity.' });
    }

    event.attendees.push(userId);
    await event.save();

    res.status(200).json({ success: true, message: 'RSVP confirmed! See you there 🎉', data: event });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Cancel an event (organizer or admin only)
// @route   PATCH /api/events/:id/cancel
// @access  Protected (organizer or admin)
// ══════════════════════════════════════════════════════════════════════════════
exports.cancelEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const isOrganizer = event.organizer.toString() === req.user.id;
    const isAdmin = req.user.isAdmin;

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the organizer or an admin can cancel this event.' });
    }

    event.isCancelled = true;
    await event.save();

    res.status(200).json({ success: true, message: 'Event cancelled.', data: event });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get events by community
// @route   GET /api/events/community/:communityId
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.getEventsByCommunity = async (req, res, next) => {
  try {
    const events = await Event.find({
      community: req.params.communityId,
      collegeDomain: req.user.collegeDomain,
    })
      .populate('organizer', 'anonymousName')
      .sort({ eventDate: 1 });

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

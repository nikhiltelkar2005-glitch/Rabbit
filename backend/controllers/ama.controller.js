const AMA = require('../models/AMA');
const { createNotification } = require('../utils/notification.util');

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Create a new AMA session
// @route   POST /api/amas
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.createAMA = async (req, res, next) => {
  try {
    const { title, description, hostContext, endsAt, tags } = req.body;

    if (new Date(endsAt) <= new Date()) {
      return res.status(400).json({ success: false, message: 'End time must be in the future.' });
    }

    const ama = await AMA.create({
      title,
      description: description || '',
      hostContext: hostContext || '',
      host: req.user.id,
      collegeDomain: req.user.collegeDomain,
      endsAt,
      tags: tags || [],
    });

    res.status(201).json({ success: true, data: ama });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get all AMAs for the user's college
// @route   GET /api/amas
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.getAllAMAs = async (req, res, next) => {
  try {
    const { filter = 'open' } = req.query; // open | closed | all

    const query = { collegeDomain: req.user.collegeDomain };

    if (filter === 'open') {
      query.isActive = true;
      query.endsAt = { $gte: new Date() };
    } else if (filter === 'closed') {
      query.$or = [{ isActive: false }, { endsAt: { $lt: new Date() } }];
    }

    const amas = await AMA.find(query)
      .populate('host', 'anonymousName badge')
      .select('-questions') // Don't load all questions in list view
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: amas.length, data: amas });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get a single AMA with all questions (sorted by upvotes)
// @route   GET /api/amas/:id
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.getAMAById = async (req, res, next) => {
  try {
    const ama = await AMA.findById(req.params.id)
      .populate('host', 'anonymousName badge');

    if (!ama) {
      return res.status(404).json({ success: false, message: 'AMA not found.' });
    }

    if (ama.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Sort questions: answered last, unanswered sorted by upvote count
    ama.questions.sort((a, b) => {
      if (a.isAnswered && !b.isAnswered) return 1;
      if (!a.isAnswered && b.isAnswered) return -1;
      return b.upvotes.length - a.upvotes.length;
    });

    res.status(200).json({ success: true, data: ama });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Ask a question in an AMA (anonymous)
// @route   POST /api/amas/:id/ask
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.askQuestion = async (req, res, next) => {
  try {
    const { question } = req.body;

    const ama = await AMA.findById(req.params.id);
    if (!ama) {
      return res.status(404).json({ success: false, message: 'AMA not found.' });
    }

    if (ama.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (!ama.isActive || new Date() > new Date(ama.endsAt)) {
      return res.status(400).json({ success: false, message: 'This AMA session has ended.' });
    }

    ama.questions.push({ question, asker: req.user.id });
    await ama.save();

    // Notify the host of a new question
    await createNotification({
      recipient: ama.host,
      type: 'post_reply',
      message: `Someone asked a question in your AMA: "${ama.title}"`,
      referenceType: 'ama',
      referenceId: ama._id,
      collegeDomain: req.user.collegeDomain,
    });

    res.status(201).json({ success: true, data: ama.questions[ama.questions.length - 1] });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Answer a question (host only)
// @route   PATCH /api/amas/:id/answer/:questionId
// @access  Protected (host only)
// ══════════════════════════════════════════════════════════════════════════════
exports.answerQuestion = async (req, res, next) => {
  try {
    const { answer } = req.body;

    const ama = await AMA.findById(req.params.id);
    if (!ama) {
      return res.status(404).json({ success: false, message: 'AMA not found.' });
    }

    if (ama.host.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the AMA host can answer questions.' });
    }

    const questionDoc = ama.questions.id(req.params.questionId);
    if (!questionDoc) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    questionDoc.answer = answer;
    questionDoc.isAnswered = true;
    await ama.save();

    // Notify the asker their question was answered
    await createNotification({
      recipient: questionDoc.asker,
      type: 'ama_answer',
      message: `Your question in the AMA "${ama.title}" was answered!`,
      referenceType: 'ama',
      referenceId: ama._id,
      collegeDomain: req.user.collegeDomain,
    });

    res.status(200).json({ success: true, data: questionDoc });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Upvote a question (so host knows which to prioritize)
// @route   POST /api/amas/:id/questions/:questionId/upvote
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.upvoteQuestion = async (req, res, next) => {
  try {
    const ama = await AMA.findById(req.params.id);
    if (!ama) {
      return res.status(404).json({ success: false, message: 'AMA not found.' });
    }

    if (ama.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const questionDoc = ama.questions.id(req.params.questionId);
    if (!questionDoc) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const userId = req.user.id;
    const alreadyUpvoted = questionDoc.upvotes.some(id => id.toString() === userId);

    if (alreadyUpvoted) {
      questionDoc.upvotes = questionDoc.upvotes.filter(id => id.toString() !== userId);
    } else {
      questionDoc.upvotes.push(userId);
    }

    await ama.save();
    res.status(200).json({ success: true, data: questionDoc });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Close an AMA early (host only)
// @route   PATCH /api/amas/:id/close
// @access  Protected (host only)
// ══════════════════════════════════════════════════════════════════════════════
exports.closeAMA = async (req, res, next) => {
  try {
    const ama = await AMA.findById(req.params.id);
    if (!ama) {
      return res.status(404).json({ success: false, message: 'AMA not found.' });
    }

    if (ama.host.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the host or an admin can close this AMA.' });
    }

    ama.isActive = false;
    await ama.save();

    res.status(200).json({ success: true, message: 'AMA closed.', data: ama });
  } catch (error) {
    next(error);
  }
};

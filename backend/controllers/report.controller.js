const Report = require('../models/Report');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Event = require('../models/Event');
const User = require('../models/User');

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Submit a report on a post, comment, event, or user
// @route   POST /api/reports
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, details } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ success: false, message: 'targetType, targetId, and reason are required.' });
    }

    // Validate the target actually exists and belongs to the same college
    let targetExists = false;
    if (targetType === 'post') {
      const post = await Post.findById(targetId);
      targetExists = post && post.collegeDomain === req.user.collegeDomain;
    } else if (targetType === 'comment') {
      const comment = await Comment.findById(targetId);
      targetExists = comment && comment.collegeDomain === req.user.collegeDomain;
    } else if (targetType === 'event') {
      const event = await Event.findById(targetId);
      targetExists = event && event.collegeDomain === req.user.collegeDomain;
    } else if (targetType === 'user') {
      const user = await User.findById(targetId);
      // User must be from same college domain
      targetExists = user && user.collegeDomain === req.user.collegeDomain;
    }

    if (!targetExists) {
      return res.status(404).json({ success: false, message: `${targetType} not found or outside your college.` });
    }

    // Prevent self-reporting
    if (targetType === 'user' && targetId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot report yourself.' });
    }

    const report = await Report.create({
      reporter: req.user.id,
      targetType,
      targetId,
      reason,
      details: details || '',
      collegeDomain: req.user.collegeDomain,
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted. Our team will review it shortly.',
      data: { reportId: report._id },
    });
  } catch (error) {
    // Unique index violation = duplicate report
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reported this content.' });
    }
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get all reports (admin only) with optional filters
// @route   GET /api/reports
// @access  Admin
// ══════════════════════════════════════════════════════════════════════════════
exports.getAllReports = async (req, res, next) => {
  try {
    const { status, targetType, page = 1, limit = 20 } = req.query;

    const query = { collegeDomain: req.user.collegeDomain };
    if (status) query.status = status;
    if (targetType) query.targetType = targetType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('reporter', 'anonymousName')
        .populate('reviewedBy', 'anonymousName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Report.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Update a report status (admin only)
// @route   PATCH /api/reports/:id
// @access  Admin
// ══════════════════════════════════════════════════════════════════════════════
exports.updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    const validStatuses = ['reviewed', 'action_taken', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    if (report.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    report.status = status;
    report.reviewedBy = req.user.id;
    report.reviewedAt = new Date();
    report.adminNotes = adminNotes || '';
    await report.save();

    res.status(200).json({ success: true, message: 'Report updated.', data: report });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Ban a user (admin only)
// @route   PATCH /api/reports/admin/ban/:userId
// @access  Admin
// ══════════════════════════════════════════════════════════════════════════════
exports.banUser = async (req, res, next) => {
  try {
    const { banReason } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ success: false, message: 'You can only ban users from your own college.' });
    }

    if (user.isAdmin) {
      return res.status(403).json({ success: false, message: 'You cannot ban an admin.' });
    }

    user.isBanned = true;
    user.banReason = banReason || 'Violation of community guidelines';
    await user.save();

    res.status(200).json({ success: true, message: `User ${user.anonymousName} has been banned.` });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Unban a user (admin only)
// @route   PATCH /api/reports/admin/unban/:userId
// @access  Admin
// ══════════════════════════════════════════════════════════════════════════════
exports.unbanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    user.isBanned = false;
    user.banReason = undefined;
    await user.save();

    res.status(200).json({ success: true, message: `User ${user.anonymousName} has been unbanned.` });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Delete any post (admin only)
// @route   DELETE /api/reports/admin/post/:postId
// @access  Admin
// ══════════════════════════════════════════════════════════════════════════════
exports.adminDeletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await post.deleteOne();
    res.status(200).json({ success: true, message: 'Post deleted by admin.' });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Delete any comment (admin only)
// @route   DELETE /api/reports/admin/comment/:commentId
// @access  Admin
// ══════════════════════════════════════════════════════════════════════════════
exports.adminDeleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    if (comment.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await comment.deleteOne();
    res.status(200).json({ success: true, message: 'Comment deleted by admin.' });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get report dashboard stats (admin only)
// @route   GET /api/reports/admin/stats
// @access  Admin
// ══════════════════════════════════════════════════════════════════════════════
exports.getReportStats = async (req, res, next) => {
  try {
    const domain = req.user.collegeDomain;

    const [pending, reviewed, actionTaken, dismissed, totalUsers, bannedUsers] = await Promise.all([
      Report.countDocuments({ collegeDomain: domain, status: 'pending' }),
      Report.countDocuments({ collegeDomain: domain, status: 'reviewed' }),
      Report.countDocuments({ collegeDomain: domain, status: 'action_taken' }),
      Report.countDocuments({ collegeDomain: domain, status: 'dismissed' }),
      User.countDocuments({ collegeDomain: domain }),
      User.countDocuments({ collegeDomain: domain, isBanned: true }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        reports: { pending, reviewed, actionTaken, dismissed, total: pending + reviewed + actionTaken + dismissed },
        users: { total: totalUsers, banned: bannedUsers },
      },
    });
  } catch (error) {
    next(error);
  }
};

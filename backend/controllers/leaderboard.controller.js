const User = require('../models/User');

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get top karma earners in the user's college
// @route   GET /api/leaderboard
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const topUsers = await User.find({
      collegeDomain: req.user.collegeDomain,
      isVerified: true,
      isBanned: false,
    })
      .select('anonymousName karma badge createdAt')
      .sort({ karma: -1 })
      .limit(Math.min(parseInt(limit), 50)); // cap at 50

    // Add rank to each result
    const ranked = topUsers.map((user, index) => ({
      rank: index + 1,
      anonymousName: user.anonymousName,
      karma: user.karma,
      badge: user.badge,
      memberSince: user.createdAt,
    }));

    // Also find the requesting user's rank
    const myRank = await User.countDocuments({
      collegeDomain: req.user.collegeDomain,
      isVerified: true,
      isBanned: false,
      karma: { $gt: req.user.karma },
    });

    res.status(200).json({
      success: true,
      data: ranked,
      myStats: {
        rank: myRank + 1,
        anonymousName: req.user.anonymousName,
        karma: req.user.karma,
        badge: req.user.badge,
      },
    });
  } catch (error) {
    next(error);
  }
};

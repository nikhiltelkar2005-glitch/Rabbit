const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboard.controller');
const { protect } = require('../middleware/auth.middleware');

// GET /api/leaderboard?limit=10  — top karma earners + caller's rank
router.route('/').get(protect, getLeaderboard);

module.exports = router;

const express = require('express');
const { createPost, getPostsByCommunity, votePost, votePoll } = require('../controllers/post.controller');
const { protect } = require('../middleware/auth.middleware');
const { postLimiter } = require('../middleware/rateLimit');
const { uploadImage } = require('../config/cloudinary');

const router = express.Router();

// POST /api/posts — create post (with optional image via multipart/form-data)
router.route('/')
  .post(protect, postLimiter, uploadImage.single('image'), createPost);

// GET /api/posts/community/:communityId — list posts (?sort=hot|new|top&flair=placement)
router.route('/community/:communityId')
  .get(protect, getPostsByCommunity);

// POST /api/posts/:id/vote      — upvote / downvote
router.route('/:id/vote')
  .post(protect, votePost);

// POST /api/posts/:id/vote-poll — vote on a poll option
router.route('/:id/vote-poll')
  .post(protect, votePoll);

module.exports = router;

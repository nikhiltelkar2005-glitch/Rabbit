const express = require('express');
const { createPost, getPostsByCommunity, votePost, votePoll } = require('../controllers/post.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .post(protect, createPost);

router.route('/community/:communityId')
  .get(getPostsByCommunity);

router.route('/:id/vote')
  .post(protect, votePost);

router.route('/:id/vote-poll')
  .post(protect, votePoll);

module.exports = router;

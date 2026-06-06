const express = require('express');
const { createPost, getPostsByCommunity, votePost } = require('../controllers/post.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .post(protect, createPost);

router.route('/community/:communityId')
  .get(getPostsByCommunity);

router.route('/:id/vote')
  .post(protect, votePost);

module.exports = router;

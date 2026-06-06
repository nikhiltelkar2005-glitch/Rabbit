const express = require('express');
const { createComment, getCommentsForPost, voteComment } = require('../controllers/comment.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .post(protect, createComment);

router.route('/post/:postId')
  .get(getCommentsForPost);

router.route('/:id/vote')
  .post(protect, voteComment);

module.exports = router;

const express = require('express');
const { createCommunity, getAllCommunities, joinCommunity } = require('../controllers/community.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .get(getAllCommunities)
  .post(protect, createCommunity);

router.route('/:id/join')
  .post(protect, joinCommunity);

module.exports = router;

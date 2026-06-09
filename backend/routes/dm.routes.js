const express = require('express');
const router = express.Router();
const { sendDM, getInbox, getConversation } = require('../controllers/dm.controller');
const { protect } = require('../middleware/auth.middleware');
const { dmLimiter } = require('../middleware/rateLimit');

// GET  /api/dms               — inbox (latest message per conversation)
// POST /api/dms               — send a DM
router.route('/')
  .get(protect, getInbox)
  .post(protect, dmLimiter, sendDM);

// GET /api/dms/:anonymousName — full conversation thread
router.route('/:anonymousName').get(protect, getConversation);

module.exports = router;

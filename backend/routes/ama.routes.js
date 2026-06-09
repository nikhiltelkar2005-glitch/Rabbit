const express = require('express');
const router = express.Router();
const {
  createAMA,
  getAllAMAs,
  getAMAById,
  askQuestion,
  answerQuestion,
  upvoteQuestion,
  closeAMA,
} = require('../controllers/ama.controller');
const { protect } = require('../middleware/auth.middleware');

// GET  /api/amas    — list AMAs (?filter=open|closed|all)
// POST /api/amas    — create an AMA session
router.route('/')
  .get(protect, getAllAMAs)
  .post(protect, createAMA);

// GET   /api/amas/:id        — single AMA with all questions
// PATCH /api/amas/:id/close  — close AMA (host only)
router.route('/:id').get(protect, getAMAById);
router.route('/:id/close').patch(protect, closeAMA);

// POST  /api/amas/:id/ask                             — ask a question
// PATCH /api/amas/:id/answer/:questionId              — answer (host only)
// POST  /api/amas/:id/questions/:questionId/upvote    — upvote a question
router.route('/:id/ask').post(protect, askQuestion);
router.route('/:id/answer/:questionId').patch(protect, answerQuestion);
router.route('/:id/questions/:questionId/upvote').post(protect, upvoteQuestion);

module.exports = router;

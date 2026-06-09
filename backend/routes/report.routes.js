const express = require('express');
const router = express.Router();
const {
  createReport,
  getAllReports,
  updateReportStatus,
  banUser,
  unbanUser,
  adminDeletePost,
  adminDeleteComment,
  getReportStats,
} = require('../controllers/report.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { reportLimiter } = require('../middleware/rateLimit');

// ─── IMPORTANT: Admin sub-routes must come BEFORE /:id ────────────────────────
// Otherwise Express will match "admin" as the :id param.

// GET  /api/reports/admin/stats
router.route('/admin/stats')
  .get(protect, adminOnly, getReportStats);

// PATCH /api/reports/admin/ban/:userId
router.route('/admin/ban/:userId')
  .patch(protect, adminOnly, banUser);

// PATCH /api/reports/admin/unban/:userId
router.route('/admin/unban/:userId')
  .patch(protect, adminOnly, unbanUser);

// DELETE /api/reports/admin/post/:postId
router.route('/admin/post/:postId')
  .delete(protect, adminOnly, adminDeletePost);

// DELETE /api/reports/admin/comment/:commentId
router.route('/admin/comment/:commentId')
  .delete(protect, adminOnly, adminDeleteComment);

// ─── Root route ───────────────────────────────────────────────────────────────
// POST /api/reports   — user submits a report
// GET  /api/reports   — admin lists all reports (with ?status= and ?targetType=)
router.route('/')
  .post(protect, reportLimiter, createReport)
  .get(protect, adminOnly, getAllReports);

// ─── Single report ────────────────────────────────────────────────────────────
// PATCH /api/reports/:id — admin updates report status
router.route('/:id')
  .patch(protect, adminOnly, updateReportStatus);

module.exports = router;


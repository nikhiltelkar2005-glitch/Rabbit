const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

// GET  /api/notifications          — get all notifications (paginated)
router.route('/').get(protect, getNotifications);

// PATCH /api/notifications/read-all — mark all as read (must be before /:id)
router.route('/read-all').patch(protect, markAllAsRead);

// PATCH  /api/notifications/:id/read — mark one as read
// DELETE /api/notifications/:id      — delete one
router.route('/:id/read').patch(protect, markAsRead);
router.route('/:id').delete(protect, deleteNotification);

module.exports = router;

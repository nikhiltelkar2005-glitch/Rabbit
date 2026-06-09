const Notification = require('../models/Notification');

/**
 * Create a notification for a user.
 * Silently swallows errors so it never breaks the main request.
 */
const createNotification = async ({ recipient, type, message, referenceType = null, referenceId = null, collegeDomain }) => {
  try {
    // Don't create a notification if the actor is the recipient (e.g. self-upvote — we block that anyway, but safety net)
    await Notification.create({ recipient, type, message, referenceType, referenceId, collegeDomain });
  } catch (err) {
    console.error('⚠️ Notification creation failed (non-fatal):', err.message);
  }
};

module.exports = { createNotification };

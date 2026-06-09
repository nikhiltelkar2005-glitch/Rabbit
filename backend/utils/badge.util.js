const User = require('../models/User');
const { createNotification } = require('./notification.util');

const BADGE_THRESHOLDS = [
  { karma: 1000, badge: 'Placement Guru' },
  { karma: 500,  badge: 'Helpful Senior' },
  { karma: 150,  badge: 'Top Contributor' },
  { karma: 50,   badge: 'Active Member' },
];

const updateKarmaAndBadge = async (userId, karmaDelta) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { karma: karmaDelta } },
      { new: true }
    );

    if (!user) return null;

    let newBadge = 'New Rabbit';
    for (const threshold of BADGE_THRESHOLDS) {
      if (user.karma >= threshold.karma) {
        newBadge = threshold.badge;
        break;
      }
    }

    if (user.badge !== newBadge) {
      user.badge = newBadge;
      await user.save();

      // Notify the user they earned a new badge
      await createNotification({
        recipient: user._id,
        type: 'badge_earned',
        message: `🏅 You just earned the "${newBadge}" badge! Keep it up!`,
        referenceType: null,
        referenceId: null,
        collegeDomain: user.collegeDomain,
      });
    }

    return user;
  } catch (error) {
    console.error('Error updating karma and badge:', error);
    return null;
  }
};

module.exports = { updateKarmaAndBadge };

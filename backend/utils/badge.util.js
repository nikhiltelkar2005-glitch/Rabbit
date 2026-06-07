const User = require('../models/User');

const updateKarmaAndBadge = async (userId, karmaDelta) => {
  try {
    // Increment karma and get the updated user
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { karma: karmaDelta } },
      { new: true }
    );

    if (!user) return null;

    let newBadge = 'New Rabbit';
    if (user.karma >= 1000) {
      newBadge = 'Placement Guru';
    } else if (user.karma >= 500) {
      newBadge = 'Helpful Senior';
    } else if (user.karma >= 150) {
      newBadge = 'Top Contributor';
    } else if (user.karma >= 50) {
      newBadge = 'Active Member';
    }

    // Update badge if it has changed
    if (user.badge !== newBadge) {
      user.badge = newBadge;
      await user.save();
    }

    return user;
  } catch (error) {
    console.error('Error updating karma and badge:', error);
    return null;
  }
};

module.exports = { updateKarmaAndBadge };

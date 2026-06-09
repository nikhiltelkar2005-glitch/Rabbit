const DirectMessage = require('../models/DirectMessage');
const User = require('../models/User');
const { createNotification } = require('../utils/notification.util');
const mongoose = require('mongoose');

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Send a DM to another user (identified by their anonymousName)
// @route   POST /api/dms
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.sendDM = async (req, res, next) => {
  try {
    const { recipientAnonymousName, content, originPostId } = req.body;

    if (!recipientAnonymousName || !content) {
      return res.status(400).json({ success: false, message: 'Recipient and content are required.' });
    }

    // Look up recipient by anonymousName within same college
    const recipient = await User.findOne({
      anonymousName: recipientAnonymousName,
      collegeDomain: req.user.collegeDomain,
    });

    if (!recipient) {
      return res.status(404).json({ success: false, message: 'User not found in your college.' });
    }

    if (recipient._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot DM yourself.' });
    }

    const dm = await DirectMessage.create({
      sender: req.user.id,
      recipient: recipient._id,
      content,
      collegeDomain: req.user.collegeDomain,
      originPost: originPostId || null,
    });

    // Fire notification to recipient
    await createNotification({
      recipient: recipient._id,
      type: 'dm_received',
      message: `${req.user.anonymousName} sent you a message.`,
      referenceType: 'dm',
      referenceId: dm._id,
      collegeDomain: req.user.collegeDomain,
    });

    res.status(201).json({ success: true, data: dm });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get inbox — list of unique conversations (latest message per person)
// @route   GET /api/dms
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.getInbox = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Aggregate: find latest message for each unique conversation partner
    const conversations = await DirectMessage.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ['$sender', '$recipient'] },
              { a: '$sender', b: '$recipient' },
              { a: '$recipient', b: '$sender' },
            ],
          },
          lastMessage: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$lastMessage' } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'senderInfo',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'recipient',
          foreignField: '_id',
          as: 'recipientInfo',
        },
      },
      {
        $project: {
          content: 1,
          createdAt: 1,
          isRead: 1,
          sender: { $arrayElemAt: ['$senderInfo.anonymousName', 0] },
          senderId: { $arrayElemAt: ['$senderInfo._id', 0] },
          recipient: { $arrayElemAt: ['$recipientInfo.anonymousName', 0] },
          recipientId: { $arrayElemAt: ['$recipientInfo._id', 0] },
        },
      },
    ]);

    res.status(200).json({ success: true, count: conversations.length, data: conversations });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get full conversation with a specific user
// @route   GET /api/dms/:anonymousName
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.getConversation = async (req, res, next) => {
  try {
    const { anonymousName } = req.params;

    const otherUser = await User.findOne({
      anonymousName,
      collegeDomain: req.user.collegeDomain,
    });

    if (!otherUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const userId = req.user._id;
    const otherId = otherUser._id;

    const messages = await DirectMessage.find({
      $or: [
        { sender: userId, recipient: otherId },
        { sender: otherId, recipient: userId },
      ],
    })
      .populate('sender', 'anonymousName')
      .populate('recipient', 'anonymousName')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await DirectMessage.updateMany(
      { sender: otherId, recipient: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    next(error);
  }
};

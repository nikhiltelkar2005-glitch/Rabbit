const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { updateKarmaAndBadge } = require('../utils/badge.util');
const { createNotification } = require('../utils/notification.util');

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Create a comment or reply
// @route   POST /api/comments
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.createComment = async (req, res, next) => {
  try {
    const { content, postId, parentCommentId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ success: false, message: 'You cannot comment on posts outside your college.' });
    }

    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ success: false, message: 'Parent comment not found.' });
      }
    }

    const comment = await Comment.create({
      content,
      post: postId,
      parentComment: parentCommentId || null,
      author: req.user.id,
      collegeDomain: req.user.collegeDomain,
    });

    // Notify post author when someone comments (not when they comment on their own post)
    if (post.author.toString() !== req.user.id) {
      await createNotification({
        recipient: post.author,
        type: 'post_reply',
        message: `${req.user.anonymousName} commented on your post: "${post.title.substring(0, 50)}"`,
        referenceType: 'post',
        referenceId: post._id,
        collegeDomain: req.user.collegeDomain,
      });
    }

    // Notify parent comment author when someone replies to their comment
    if (parentComment && parentComment.author.toString() !== req.user.id) {
      await createNotification({
        recipient: parentComment.author,
        type: 'comment_reply',
        message: `${req.user.anonymousName} replied to your comment.`,
        referenceType: 'comment',
        referenceId: comment._id,
        collegeDomain: req.user.collegeDomain,
      });
    }

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get all comments for a post
// @route   GET /api/comments/post/:postId
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.getCommentsForPost = async (req, res, next) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      collegeDomain: req.user.collegeDomain,
    })
      .populate('author', 'anonymousName badge')
      .sort('createdAt');

    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Upvote / downvote a comment
// @route   POST /api/comments/:id/vote
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.voteComment = async (req, res, next) => {
  try {
    const { type } = req.body; // 'upvote', 'downvote', or 'none'
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    if (comment.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ success: false, message: 'You cannot vote on comments outside your college.' });
    }

    const userId = req.user.id;

    let prevVote = 0;
    if (comment.upvotes.includes(userId)) prevVote = 1;
    else if (comment.downvotes.includes(userId)) prevVote = -1;

    let newVote = 0;
    if (type === 'upvote') newVote = 1;
    else if (type === 'downvote') newVote = -1;

    comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId);
    comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId);

    if (newVote === 1) comment.upvotes.push(userId);
    else if (newVote === -1) comment.downvotes.push(userId);

    await comment.save();

    const karmaDelta = newVote - prevVote;
    if (karmaDelta !== 0 && comment.author.toString() !== userId) {
      await updateKarmaAndBadge(comment.author, karmaDelta);
    }

    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

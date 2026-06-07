const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { updateKarmaAndBadge } = require('../utils/badge.util');

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

    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (!parent) {
        return res.status(404).json({ success: false, message: 'Parent comment not found.' });
      }
    }

    const comment = await Comment.create({
      content,
      post: postId,
      parentComment: parentCommentId || null,
      author: req.user.id,
      collegeDomain: req.user.collegeDomain
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

exports.getCommentsForPost = async (req, res, next) => {
  try {
    const comments = await Comment.find({ 
      post: req.params.postId,
      collegeDomain: req.user.collegeDomain 
    })
      .populate('author', 'anonymousName')
      .sort('createdAt'); // Sort oldest first so threads read naturally

    res.status(200).json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    next(error);
  }
};

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

    if (newVote === 1) {
      comment.upvotes.push(userId);
    } else if (newVote === -1) {
      comment.downvotes.push(userId);
    }

    await comment.save();

    const karmaDelta = newVote - prevVote;
    if (karmaDelta !== 0) {
      if (comment.author.toString() !== userId) {
        await updateKarmaAndBadge(comment.author, karmaDelta);
      }
    }

    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

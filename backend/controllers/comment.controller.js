const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.createComment = async (req, res, next) => {
  try {
    const { content, postId, parentCommentId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
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
      author: req.user.id
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

exports.getCommentsForPost = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
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

    const userId = req.user.id;

    comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId);
    comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId);

    if (type === 'upvote') {
      comment.upvotes.push(userId);
    } else if (type === 'downvote') {
      comment.downvotes.push(userId);
    }

    await comment.save();

    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

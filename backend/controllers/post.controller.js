const Post = require('../models/Post');
const Community = require('../models/Community');

exports.createPost = async (req, res, next) => {
  try {
    const { title, content, communityId } = req.body;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found.' });
    }

    const post = await Post.create({
      title,
      content,
      community: communityId,
      author: req.user.id
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

exports.getPostsByCommunity = async (req, res, next) => {
  try {
    const posts = await Post.find({ community: req.params.communityId })
      .populate('author', 'anonymousName') // Crucial: Only expose the anonymousName!
      .sort('-createdAt');

    res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    next(error);
  }
};

exports.votePost = async (req, res, next) => {
  try {
    const { type } = req.body; // 'upvote', 'downvote', or 'none' (to remove vote)
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const userId = req.user.id;

    // Remove user from both arrays first to reset their vote
    post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
    post.downvotes = post.downvotes.filter(id => id.toString() !== userId);

    if (type === 'upvote') {
      post.upvotes.push(userId);
    } else if (type === 'downvote') {
      post.downvotes.push(userId);
    }

    await post.save();

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

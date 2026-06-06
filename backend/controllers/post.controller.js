const Post = require('../models/Post');
const Community = require('../models/Community');
const User = require('../models/User');

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

    let prevVote = 0;
    if (post.upvotes.includes(userId)) prevVote = 1;
    else if (post.downvotes.includes(userId)) prevVote = -1;

    let newVote = 0;
    if (type === 'upvote') newVote = 1;
    else if (type === 'downvote') newVote = -1;

    // Remove user from both arrays first to reset their vote
    post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
    post.downvotes = post.downvotes.filter(id => id.toString() !== userId);

    if (newVote === 1) {
      post.upvotes.push(userId);
    } else if (newVote === -1) {
      post.downvotes.push(userId);
    }

    await post.save();

    const karmaDelta = newVote - prevVote;
    if (karmaDelta !== 0) {
      // Don't award karma if they vote on their own post
      if (post.author.toString() !== userId) {
        await User.findByIdAndUpdate(post.author, { $inc: { karma: karmaDelta } });
      }
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

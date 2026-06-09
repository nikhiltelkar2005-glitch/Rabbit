const Post = require('../models/Post');
const Community = require('../models/Community');
const User = require('../models/User');
const { updateKarmaAndBadge } = require('../utils/badge.util');
const { createNotification } = require('../utils/notification.util');

const UPVOTE_MILESTONES = [10, 50, 100, 500];

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Create a post (with optional image + flair)
// @route   POST /api/posts
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, communityId, isPoll, pollOptions, pollEndsAt, flair } = req.body;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found.' });
    }

    if (community.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ success: false, message: 'You cannot post in a community outside your college.' });
    }

    let processedPollOptions = [];
    if (isPoll) {
      if (!Array.isArray(pollOptions) || pollOptions.length < 2 || pollOptions.length > 6) {
        return res.status(400).json({ success: false, message: 'A poll must have between 2 and 6 options.' });
      }
      processedPollOptions = pollOptions.map(opt => ({
        optionText: opt,
        votes: 0,
        voters: [],
      }));
    }

    const post = await Post.create({
      title,
      content,
      community: communityId,
      author: req.user.id,
      collegeDomain: req.user.collegeDomain,
      isPoll: isPoll || false,
      pollOptions: processedPollOptions,
      pollEndsAt: pollEndsAt || null,
      flair: flair || null,
      imageUrl: req.file ? req.file.path : null, // set by multer-cloudinary middleware
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Get posts by community (with sort + flair filter)
// @route   GET /api/posts/community/:communityId
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.getPostsByCommunity = async (req, res, next) => {
  try {
    const { sort, flair } = req.query;
    let sortOption = '-trendingScore'; // Default: hot

    if (sort === 'new') sortOption = '-createdAt';
    else if (sort === 'top') sortOption = '-upvotes';

    const filter = {
      community: req.params.communityId,
      collegeDomain: req.user.collegeDomain,
    };

    if (flair) filter.flair = flair;

    const posts = await Post.find(filter)
      .populate('author', 'anonymousName badge')
      .sort(sortOption);

    res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Upvote / downvote a post
// @route   POST /api/posts/:id/vote
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.votePost = async (req, res, next) => {
  try {
    const { type } = req.body; // 'upvote', 'downvote', or 'none'
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ success: false, message: 'You cannot vote on posts outside your college.' });
    }

    const userId = req.user.id;

    let prevVote = 0;
    if (post.upvotes.includes(userId)) prevVote = 1;
    else if (post.downvotes.includes(userId)) prevVote = -1;

    let newVote = 0;
    if (type === 'upvote') newVote = 1;
    else if (type === 'downvote') newVote = -1;

    post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
    post.downvotes = post.downvotes.filter(id => id.toString() !== userId);

    if (newVote === 1) post.upvotes.push(userId);
    else if (newVote === -1) post.downvotes.push(userId);

    await post.save();

    const karmaDelta = newVote - prevVote;
    const isOwnPost = post.author.toString() === userId;

    if (karmaDelta !== 0 && !isOwnPost) {
      await updateKarmaAndBadge(post.author, karmaDelta);

      // Fire notification at upvote milestones
      if (newVote === 1) {
        const upvoteCount = post.upvotes.length;
        if (UPVOTE_MILESTONES.includes(upvoteCount)) {
          await createNotification({
            recipient: post.author,
            type: 'post_upvote',
            message: `🎉 Your post "${post.title.substring(0, 50)}" just hit ${upvoteCount} upvotes!`,
            referenceType: 'post',
            referenceId: post._id,
            collegeDomain: post.collegeDomain,
          });
        }
      }
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// @desc    Vote on a poll option
// @route   POST /api/posts/:id/vote-poll
// @access  Protected
// ══════════════════════════════════════════════════════════════════════════════
exports.votePoll = async (req, res, next) => {
  try {
    const { optionId } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (!post.isPoll) {
      return res.status(400).json({ success: false, message: 'This post is not a poll.' });
    }

    if (post.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ success: false, message: 'You cannot vote on polls outside your college.' });
    }

    if (post.pollEndsAt && new Date() > new Date(post.pollEndsAt)) {
      return res.status(400).json({ success: false, message: 'This poll has ended.' });
    }

    const userId = req.user.id;

    post.pollOptions.forEach(option => {
      const voterIndex = option.voters.findIndex(v => v.toString() === userId);
      if (voterIndex !== -1) {
        option.voters.splice(voterIndex, 1);
        option.votes = Math.max(0, option.votes - 1);
      }
    });

    if (optionId) {
      const selectedOption = post.pollOptions.find(opt => opt._id.toString() === optionId);
      if (!selectedOption) {
        return res.status(404).json({ success: false, message: 'Poll option not found.' });
      }
      selectedOption.voters.push(userId);
      selectedOption.votes += 1;
    }

    await post.save();
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

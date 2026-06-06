const Post = require('../models/Post');
const Community = require('../models/Community');

exports.searchQuery = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Please provide a search query (?q=...)' });
    }

    // Perform text search on Communities
    const communities = await Community.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });

    // Perform text search on Posts
    const posts = await Post.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .populate('author', 'anonymousName')
      .populate('community', 'name')
      .sort({ score: { $meta: 'textScore' } });

    res.status(200).json({
      success: true,
      data: {
        communities,
        posts
      }
    });
  } catch (error) {
    next(error);
  }
};

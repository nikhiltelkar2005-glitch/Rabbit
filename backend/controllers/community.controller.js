const Community = require('../models/Community');

exports.createCommunity = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const existingCommunity = await Community.findOne({ name: name.toLowerCase() });
    if (existingCommunity) {
      return res.status(400).json({ success: false, message: 'Community with this name already exists.' });
    }

    const community = await Community.create({
      name,
      description,
      creator: req.user.id,
      members: [req.user.id] // Creator automatically joins
    });

    res.status(201).json({ success: true, data: community });
  } catch (error) {
    next(error);
  }
};

exports.getAllCommunities = async (req, res, next) => {
  try {
    const communities = await Community.find().select('-__v');
    res.status(200).json({ success: true, count: communities.length, data: communities });
  } catch (error) {
    next(error);
  }
};

exports.joinCommunity = async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found.' });
    }

    if (community.members.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You are already a member of this community.' });
    }

    community.members.push(req.user.id);
    await community.save();

    res.status(200).json({ success: true, message: 'Joined community successfully', data: community });
  } catch (error) {
    next(error);
  }
};

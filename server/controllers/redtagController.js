const Client = require('../models/Client');

// @desc    Get Red Tag Clients
// @route   GET /api/redtag
// @access  Private (Owner)
exports.getRedTagClients = async (req, res, next) => {
  try {
    const gymIdStr = req.user.gymId;
    const clients = await Client.find({ gymId: gymIdStr, 'membership.status': 'red_tag' }).sort({ 'membership.endDate': 1 });
    res.status(200).json({ success: true, count: clients.length, data: clients });
  } catch (err) {
    next(err);
  }
};

const Gym = require('../models/Gym');
const Owner = require('../models/Owner');
const Client = require('../models/Client');
const Plan = require('../models/Plan');

// @desc    Get Gym Profile
// @route   GET /api/gym/profile
// @access  Private (Owner)
exports.getGymProfile = async (req, res, next) => {
  try {
    const gymStrId = req.user._id.toString();
    const gym = await Gym.findById(gymStrId).select('-password');
    const owner = await Owner.findOne({ gymId: gymStrId });
    res.status(200).json({ success: true, data: { gym, owner } });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Gym Profile
// @route   PUT /api/gym/profile
// @access  Private (Owner)
exports.updateGymProfile = async (req, res, next) => {
  try {
    const { gymData, ownerData } = req.body;
    const gymStrId = req.user._id.toString();

    let updatedGym, updatedOwner;
    
    if (gymData) {
        if(gymData.password) {
            // Can't update password like this with findByIdAndUpdate directly cleanly b/c of pre-save hook, 
            // but let's assume we don't update password here.
            delete gymData.password;
        }
        updatedGym = await Gym.findByIdAndUpdate(gymStrId, gymData, { new: true, runValidators: true }).select('-password');
    }

    if (ownerData) {
        updatedOwner = await Owner.findOneAndUpdate({ gymId: gymStrId }, ownerData, { new: true, runValidators: true });
    }

    res.status(200).json({ success: true, data: { gym: updatedGym, owner: updatedOwner } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Owner Dashboard Stats
// @route   GET /api/gym/dashboard
// @access  Private (Owner)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const gymIdStr = req.user.gymId;

    const totalClients = await Client.countDocuments({ gymId: gymIdStr });
    const activeClients = await Client.countDocuments({ gymId: gymIdStr, 'membership.status': 'active' });
    const expiringSoon = await Client.countDocuments({ gymId: gymIdStr, 'membership.status': 'expiring_soon' });
    const redTagClients = await Client.countDocuments({ gymId: gymIdStr, 'membership.status': 'red_tag' });
    const totalPlans = await Plan.countDocuments({ gymId: gymIdStr, isActive: true });

    // Fetch lists
    const expiringSoonList = await Client.find({ gymId: gymIdStr, 'membership.status': 'expiring_soon' }).limit(3);
    const redTagList = await Client.find({ gymId: gymIdStr, 'membership.status': 'red_tag' }).limit(3);
    const pendingList = await Client.find({ gymId: gymIdStr, 'membership.requestApproved': false });

    res.status(200).json({
      success: true,
      data: {
        stats: { totalClients, activeClients, expiringSoon, redTagClients, totalPlans },
        expiringSoonList,
        redTagList,
        pendingList
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Gym Public Profile
// @route   GET /api/gym/public/:gymId
// @access  Public
exports.getGymPublicProfile = async (req, res, next) => {
   try {
       const gym = await Gym.findOne({ gymId: req.params.gymId });
       if (!gym) return res.status(404).json({ success: false, message: 'Gym not found' });
       res.status(200).json({ success: true, data: { gymName: gym.gymName } });
   } catch (err) { next(err); }
};

const Gym = require('../models/Gym');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const Owner = require('../models/Owner');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private (SuperAdmin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalGyms = await Gym.countDocuments();
    const totalClients = await Client.countDocuments();
    const totalPayments = await Payment.countDocuments();

    res.status(200).json({
      success: true,
      data: { totalGyms, totalClients, totalPayments }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get All Gyms
// @route   GET /api/admin/gyms
// @access  Private (SuperAdmin)
exports.getAllGyms = async (req, res, next) => {
  try {
    const gyms = await Gym.find().select('-password');
    // For admin list, we might want to also fetch owner info, we can do it via a join/aggregation or manual mapping
    const owners = await Owner.find();
    
    const data = gyms.map(gym => {
        const owner = owners.find(o => o.gymId.toString() === gym._id.toString());
        return {
            ...gym.toObject(),
            ownerName: owner ? owner.name : 'N/A'
        }
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle Gym Status (activate/deactivate)
// @route   PUT /api/admin/gym/:id/status
// @access  Private (SuperAdmin)
exports.toggleGymStatus = async (req, res, next) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return res.status(404).json({ success: false, message: 'Gym not found' });

    gym.isActive = !gym.isActive;
    await gym.save();

    res.status(200).json({ success: true, data: gym });
  } catch (err) {
    next(err);
  }
};

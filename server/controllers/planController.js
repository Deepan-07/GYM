const Plan = require('../models/Plan');

// @desc    Create a new plan
// @route   POST /api/plan
// @access  Private (Owner)
exports.createPlan = async (req, res, next) => {
  try {
    const { planName, durationMonths, price, description } = req.body;
    const gymId = req.user.gymId; // string prefix format

    const plan = await Plan.create({
      gymId,
      planName,
      durationMonths,
      price,
      description
    });

    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all plans for a gym
// @route   GET /api/plan
// @access  Public or Private
exports.getPlans = async (req, res, next) => {
  try {
    let gymId = null;
    if(req.userRole === 'owner') {
        gymId = req.user.gymId;
    } else if(req.userRole === 'client') {
        gymId = req.user.gymId;
    } else if(req.query.gymId) {
        gymId = req.query.gymId;
    }

    if(!gymId) {
        return res.status(400).json({ success: false, message: 'gymId is required' });
    }

    const plans = await Plan.find({ gymId, isActive: true });
    res.status(200).json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a plan
// @route   PUT /api/plan/:id
// @access  Private (Owner)
exports.updatePlan = async (req, res, next) => {
  try {
    const { planName, durationMonths, price, description } = req.body;
    const plan = await Plan.findByIdAndUpdate(req.params.id, { planName, durationMonths, price, description }, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete (deactivate) a plan
// @route   DELETE /api/plan/:id
// @access  Private (Owner)
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

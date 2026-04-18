const Client = require('../models/Client');
const { generateClientId } = require('../utils/generateId');
const Plan = require('../models/Plan');
const { buildMembershipWindow } = require('../utils/membership');

// @desc    Get all clients for gym
// @route   GET /api/client
// @access  Private (Owner, Admin)
exports.getClients = async (req, res, next) => {
  try {
    const gymIdStr = req.userRole === 'owner' ? req.user.gymId : req.query.gymId;
    
    // Optional filtering
    const { status } = req.query;
    let query = { gymId: gymIdStr };
    if (status && status !== 'All') {
      query['membership.status'] = status.toLowerCase().replace(' ', '_');
    }

    const clients = await Client.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: clients.length, data: clients });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Client Profile (For Client User)
// @route   GET /api/client/profile
// @access  Private (Client)
exports.getClientProfile = async (req, res, next) => {
  try {
    // req.user is Client
    const client = await Client.findById(req.user._id).populate('membership.planId');
    res.status(200).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Client Profile
// @route   PUT /api/client/profile
// @access  Private (Client)
exports.updateClientProfile = async (req, res, next) => {
  try {
    const { personalInfo = {} } = req.body;
    const client = await Client.findById(req.user._id);

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    client.personalInfo = {
      ...client.personalInfo.toObject(),
      ...personalInfo
    };

    await client.save();

    res.status(200).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

// @desc    Owner Add Client directly
// @route   POST /api/client
// @access  Private (Owner)
exports.addClient = async (req, res, next) => {
  try {
    const gymIdStr = req.user.gymId;
    const gymNameStr = req.user.gymName;
    const { personalInfo, password, membership } = req.body;

    if (!personalInfo?.email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const clientExists = await Client.findOne({ gymId: gymIdStr, 'personalInfo.email': personalInfo.email });
    if (clientExists) return res.status(400).json({ success: false, message: 'Client email exists in this gym.' });

    const plan = await Plan.findOne({ _id: membership?.planId, gymId: gymIdStr, isActive: true });
    if (!plan) {
      return res.status(400).json({ success: false, message: 'Selected plan not found' });
    }

    const clientId = await generateClientId(gymIdStr);
    const membershipWindow = buildMembershipWindow({
      startDate: membership?.startDate || Date.now(),
      durationMonths: plan.durationMonths
    });

    const client = await Client.create({
      clientId,
      gymId: gymIdStr,
      gymName: gymNameStr,
      personalInfo,
      password,
      avatar: personalInfo.name.charAt(0).toUpperCase(),
      membership: {
        planId: plan._id,
        planName: plan.planName,
        durationMonths: plan.durationMonths,
        startDate: membershipWindow.startDate,
        endDate: membershipWindow.endDate,
        daysLeft: membershipWindow.daysLeft,
        status: membershipWindow.status,
        requestApproved: true
      }
    });

    res.status(201).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Client by ID (For Owner)
// @route   GET /api/client/:id
// @access  Private (Owner)
exports.getClientById = async (req, res, next) => {
  try {
     const client = await Client.findById(req.params.id).populate('paymentHistory');
     if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
     res.status(200).json({ success: true, data: client });
  } catch (err) {
      next(err);
  }
};

// @desc    Delete Client
// @route   DELETE /api/client/:id
// @access  Private (Owner)
exports.deleteClient = async (req, res, next) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve Pending Client
// @route   PUT /api/client/:id/approve
// @access  Private (Owner)
exports.approveClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    if (client.gymId !== req.user.gymId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const plan = await Plan.findOne({ _id: client.membership.planId, gymId: client.gymId, isActive: true });
    if (!plan) return res.status(400).json({ success: false, message: 'Plan not found' });
    const membershipWindow = buildMembershipWindow({
      startDate: client.membership.startDate || Date.now(),
      durationMonths: plan.durationMonths
    });

    if (!client.clientId) {
      client.clientId = await generateClientId(client.gymId);
    }

    client.gymName = req.user.gymName;
    client.membership.requestApproved = true;
    client.membership.status = membershipWindow.status;
    client.membership.startDate = membershipWindow.startDate;
    client.membership.endDate = membershipWindow.endDate;
    client.membership.daysLeft = membershipWindow.daysLeft;
    client.membership.planName = plan.planName;
    client.membership.durationMonths = plan.durationMonths;

    await client.save();
    res.status(200).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

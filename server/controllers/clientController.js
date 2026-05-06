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

    const { status, planName, plan } = req.query;
    let query = { gymId: gymIdStr, isActive: true };

    if (status && status !== 'All') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (status === 'Active') {
        query['membership.requestApproved'] = true;
        query.memberships = { 
          $elemMatch: { 
            startDate: { $lte: today }, 
            endDate: { $gte: today } 
          } 
        };
      } else if (status === 'Upcoming') {
        query['membership.requestApproved'] = true;
        query.memberships = { 
          $elemMatch: { 
            startDate: { $gt: today } 
          } 
        };
      } else if (status === 'Expiring Soon') {
        query['membership.requestApproved'] = true;
        query.memberships = { 
          $elemMatch: { 
            endDate: { $gte: today, $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) } 
          } 
        };
      } else if (status === 'Dues') {
        query.paymentStatus = { $in: ['overdue', 'partial'] };
        query.memberships = { $elemMatch: { endDate: { $gte: today } } }; // Must not be expired
      } else if (status === 'pending') {
        query['membership.requestApproved'] = false;
      }
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.$or = [
        { memberships: { $elemMatch: { endDate: { $gte: today } } } },
        { 'membership.requestApproved': false }
      ];
    }

    const selectedPlan = planName || plan;
    if (selectedPlan && selectedPlan !== 'All') {
      query['membership.planName'] = selectedPlan;
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
    const clientId = req.user._id.toString();
    const phoneRegex = /^[6-9]\d{9}$/;

    // Duplicate Email Check
    if (personalInfo.email) {
      const emailExists = await Client.findOne({ 'personalInfo.email': personalInfo.email, _id: { $ne: clientId } });
      if (emailExists) return res.status(400).json({ success: false, message: 'Email already exists', field: 'email' });
    }

    // Duplicate Mobile Check
    if (personalInfo.mobileNo) {
      if (!phoneRegex.test(personalInfo.mobileNo)) return res.status(400).json({ success: false, message: 'Enter a valid Indian mobile number', field: 'mobileNo' });
      const mobileExists = await Client.findOne({ 'personalInfo.mobileNo': personalInfo.mobileNo, _id: { $ne: clientId } });
      if (mobileExists) return res.status(400).json({ success: false, message: 'Phone number already exists', field: 'mobileNo' });
    }

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

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
    const { personalInfo, password, membership, payment } = req.body;

    if (!personalInfo?.email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    if (!payment) {
      return res.status(400).json({ success: false, message: 'Payment information is mandatory' });
    }

    const clientExists = await Client.findOne({ gymId: gymIdStr, 'personalInfo.email': personalInfo.email });
    if (clientExists) return res.status(400).json({ success: false, message: 'Client email exists in this gym.' });

    let planName = membership?.planType;
    let planDurationMonths = 1;
    let planId = membership?.planId;
    let planPrice = 0;

    if (membership?.planType === 'Custom') {
      planDurationMonths = membership.customMonths;
      planId = null;
      planPrice = payment.amount || 0;
    } else {
      const plan = await Plan.findOne({ _id: membership?.planId, gymId: gymIdStr, isActive: true });
      if (!plan) {
        return res.status(400).json({ success: false, message: 'Selected plan not found' });
      }
      planName = plan.name;
      planDurationMonths = plan.durationMonths;
      planPrice = plan.price;
    }

    const clientId = await generateClientId(gymIdStr);
    const membershipWindow = buildMembershipWindow({
      startDate: membership?.startDate || Date.now(),
      durationMonths: planDurationMonths
    });

    // Create Client
    const client = await Client.create({
      clientId,
      gymId: gymIdStr,
      gymName: gymNameStr,
      personalInfo,
      password,
      avatar: personalInfo.name.charAt(0).toUpperCase(),
      paymentStatus: payment.paidAmount >= planPrice ? 'paid' : 'overdue',
      memberships: [{
        planId: planId,
        planName,
        planDurationMonths,
        startDate: membershipWindow.startDate,
        endDate: membershipWindow.endDate,
        finalPrice: planPrice,
        totalPaid: payment.paidAmount,
        dueDate: payment.dueDate
      }],
      membership: {
        planId: planId,
        planName,
        planDurationMonths,
        durationMonths: planDurationMonths, // backward compat
        customMonths: membership?.planType === 'Custom' ? membership.customMonths : undefined,
        startDate: membershipWindow.startDate,
        endDate: membershipWindow.endDate,
        daysLeft: membershipWindow.daysLeft,
        requestApproved: true
      }
    });

    // Create Payment Record (MANDATORY)
    const Payment = require('../models/Payment');
    const Gym = require('../models/Gym');
    const { generatePaymentId } = require('../utils/generateId');
    
    const gym = await Gym.findOne({ gymId: gymIdStr });
    const paymentId = await generatePaymentId(gymIdStr, gym?.billingInfo?.billingIdPrefix || 'BILL');

    const paymentRecord = await Payment.create({
      paymentId,
      gymId: gymIdStr,
      clientId: client._id.toString(),
      clientName: personalInfo.name,
      planId: planId,
      planName: planName,
      amount: planPrice,
      paidAmount: payment.paidAmount,
      status: payment.paidAmount >= planPrice ? 'paid' : (payment.paidAmount > 0 ? 'partial' : 'overdue'),
      paymentMethod: payment.paymentMethod,
      dueDate: payment.dueDate,
      startDate: membershipWindow.startDate,
      isPlanActivated: true
    });

    // Update client with payment reference
    client.paymentHistory = [paymentRecord._id];
    await client.save();

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
    const Payment = require('../models/Payment');
    const clientDoc = await Client.findById(req.params.id).populate('paymentHistory');
    if (!clientDoc) return res.status(404).json({ success: false, message: 'Client not found' });

    const client = clientDoc.toObject();

    // Fetch all payments for this client to aggregate for memberships
    const allPayments = await Payment.find({ clientId: client._id.toString() });

    if (client.memberships && Array.isArray(client.memberships)) {
      client.memberships = client.memberships.map(m => {
        // Find all payments belonging to this membership period
        // We match by planId and startDate as these define the membership window
        const relatedPayments = allPayments.filter(p => 
          p.planId?.toString() === m.planId?.toString() &&
          new Date(p.startDate).getTime() === new Date(m.startDate).getTime()
        );

        const totalPaid = relatedPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
        
        // Fallback for existing records where finalPrice might be 0
        const effectiveFinalPrice = m.finalPrice || (relatedPayments.length > 0 ? relatedPayments[0].amount : 0);
        
        const balance = effectiveFinalPrice - totalPaid;
        
        // Use the latest due date from the related payments if available
        const latestPaymentWithDueDate = [...relatedPayments]
          .filter(p => p.dueDate)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        return {
          ...m,
          finalPrice: effectiveFinalPrice,
          totalPaid,
          balance: balance > 0 ? balance : 0,
          dueDate: latestPaymentWithDueDate ? latestPaymentWithDueDate.dueDate : m.dueDate
        };
      });
    }

    res.status(200).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

// @desc    Deactivate Client (formerly Delete)
// @route   DELETE /api/client/:id
// @access  Private (Owner)
exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    client.isActive = false;
    client.deactivatedAt = new Date();
    await client.save();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// @desc    Get inactive clients for gym
// @route   GET /api/client/inactive
// @access  Private (Owner, Admin)
exports.getInactiveClients = async (req, res, next) => {
  try {
    const gymIdStr = req.userRole === 'owner' ? req.user.gymId : req.query.gymId;

    const { status, planName, plan } = req.query;
    let query = { gymId: gymIdStr, isActive: false };

    if (status && status !== 'All') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (status === 'Active') {
        query.memberships = { 
          $elemMatch: { 
            startDate: { $lte: today }, 
            endDate: { $gte: today } 
          } 
        };
      } else if (status === 'Upcoming') {
        query.memberships = { 
          $elemMatch: { 
            startDate: { $gt: today } 
          } 
        };
      } else if (status === 'Expired') {
        query.memberships = { 
          $elemMatch: { 
            endDate: { $lt: today } 
          } 
        };
      }
    }

    const selectedPlan = planName || plan;
    if (selectedPlan && selectedPlan !== 'All') {
      query['membership.planName'] = selectedPlan;
    }

    const clients = await Client.find(query).sort({ deactivatedAt: -1 });
    res.status(200).json({ success: true, count: clients.length, data: clients });
  } catch (err) {
    console.error("GET INACTIVE CLIENTS ERROR:", err);
    res.status(500).json({ success: false, message: err.message, stack: err.stack });
  }
};

// @desc    Reactivate Client
// @route   PUT /api/client/:id/reactivate
// @access  Private (Owner)
exports.reactivateClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    client.isActive = true;
    client.deactivatedAt = null;
    await client.save();
    res.status(200).json({ success: true, data: client });
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

    let planName = client.membership.planName;
    let planDurationMonths = client.membership.planDurationMonths || 1;

    if (client.membership.planId) {
      const plan = await Plan.findOne({ _id: client.membership.planId, gymId: client.gymId, isActive: true });
      if (plan) {
        planName = plan.name;
        planDurationMonths = plan.durationMonths;
      }
    } else if (client.membership.customMonths) {
      planDurationMonths = client.membership.customMonths;
    }

    const membershipWindow = buildMembershipWindow({
      startDate: client.membership.startDate || Date.now(),
      durationMonths: planDurationMonths
    });

    if (!client.clientId) {
      client.clientId = await generateClientId(client.gymId);
    }

    const newPlan = {
      planId: client.membership.planId,
      planName,
      planDurationMonths,
      startDate: membershipWindow.startDate,
      endDate: membershipWindow.endDate
    };

    if (!client.memberships) client.memberships = [];
    client.memberships.push(newPlan);

    client.gymName = req.user.gymName;
    client.membership.requestApproved = true;
    client.membership.startDate = membershipWindow.startDate;
    client.membership.endDate = membershipWindow.endDate;
    client.membership.daysLeft = membershipWindow.daysLeft;
    client.membership.planName = planName;
    client.membership.planDurationMonths = planDurationMonths;
    client.membership.durationMonths = planDurationMonths; // backward compat

    await client.save();
    res.status(200).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

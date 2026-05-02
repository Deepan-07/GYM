const Payment = require('../models/Payment');
const Client = require('../models/Client');
const Gym = require('../models/Gym');
const { generatePaymentId } = require('../utils/generateId');
const sendWhatsApp = require('../utils/sendWhatsApp');
const { buildMembershipWindow } = require('../utils/membership');
const { syncClientStatus } = require('../utils/syncStatus');

// Helper to assign or renew a plan
const assignOrRenewPlan = async (client, planId, startDateStr, paymentData = {}) => {
  const Plan = require('../models/Plan');
  const planDetails = await Plan.findById(planId);
  if (!planDetails) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Get current memberships and find the absolute latest end date
  const memberships = client.memberships || [];
  const latestPlan = memberships.length > 0 
    ? [...memberships].sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0]
    : null;

  let finalStartDate = startDateStr ? new Date(startDateStr) : new Date();
  finalStartDate.setHours(0, 0, 0, 0);

  // 2. Apply Non-Overlap Rule
  if (latestPlan) {
    const latestEndDate = new Date(latestPlan.endDate);
    latestEndDate.setHours(0, 0, 0, 0);

    if (finalStartDate <= latestEndDate) {
      // OVERLAP detected -> Auto shift
      const nextDay = new Date(latestEndDate);
      nextDay.setDate(nextDay.getDate() + 1);
      finalStartDate = nextDay;
    }
  }

  const { endDate } = buildMembershipWindow({
    startDate: finalStartDate,
    durationMonths: planDetails.durationMonths
  });

  const newPlan = {
    planId: planId,
    planName: planDetails.name,
    planDurationMonths: planDetails.durationMonths,
    startDate: finalStartDate,
    endDate: endDate,
    finalPrice: Number(paymentData.amount) || planDetails.price || 0,
    totalPaid: Number(paymentData.paidAmount) || 0,
    dueDate: paymentData.dueDate ? new Date(paymentData.dueDate) : null
  };

  if (!client.memberships) client.memberships = [];
  client.memberships.push(newPlan);

  // Update primary membership field for backward compatibility (set to the most relevant plan)
  // Usually the one that just got added or the current active one
  client.membership = {
    ...newPlan,
    requestApproved: true
  };
  
  return newPlan;
};

// @desc    Record Payment
// @route   POST /api/payment
// @access  Private (Owner)
exports.recordPayment = async (req, res, next) => {
  try {
    const { clientId, planId, planName, amount, paidAmount = 0, paymentMethod = 'cash', dueDate, startDate } = req.body;
    const gymIdStr = req.user.gymId;

    if (!planId) return res.status(400).json({ success: false, message: 'Plan is required for payment' });

    const client = await Client.findOne({ _id: clientId, gymId: gymIdStr });
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    // Duplicate prevention: Check if a similar payment was recorded in the last 5 seconds
    const recentPayment = await Payment.findOne({
      clientId: client._id,
      gymId: gymIdStr,
      planId: planId,
      createdAt: { $gt: new Date(Date.now() - 5000) }
    });

    if (recentPayment) {
      return res.status(400).json({ success: false, message: 'Duplicate payment detected. Please wait.' });
    }

    const gym = await Gym.findOne({ gymId: gymIdStr });
    const paymentId = await generatePaymentId(gymIdStr, gym.billingInfo?.billingIdPrefix || 'BILL');

    const numAmount = Number(amount) || 0;
    const safePaidAmount = Number(paidAmount) || 0;
    
    // Status logic for the Payment record itself
    let paymentStatus = 'pending';
    if (safePaidAmount >= numAmount) paymentStatus = 'paid';
    else if (safePaidAmount > 0) paymentStatus = 'partial';

    const computedDueDate = dueDate ? new Date(dueDate) : null;

    // Create/Update membership in client document
    let activatedPlan = await assignOrRenewPlan(client, planId, startDate, {
      amount: numAmount,
      paidAmount: safePaidAmount,
      dueDate: computedDueDate
    });

    const payment = await Payment.create({
      paymentId,
      gymId: gymIdStr,
      clientId: client._id,
      clientName: client.personalInfo.name,
      planId,
      planName: planName || activatedPlan.planName, 
      amount: numAmount,
      paidAmount: safePaidAmount,
      status: paymentStatus,
      paymentMethod,
      mode: paymentMethod,
      paymentDate: new Date(),
      dueDate: computedDueDate,
      startDate: activatedPlan.startDate,
      isPlanActivated: true,
      date: new Date(),
      billSentViaWhatsApp: false
    });

    client.paymentHistory.push(payment._id);
    await client.save();

    // Send Bill via WhatsApp
    payment.billSentViaWhatsApp = true;
    await payment.save();

    const billMessage = `Hello ${client.personalInfo.name}, your payment of ₹${safePaidAmount} for ${activatedPlan.planName} is received. Receipt No: ${paymentId}. Regards, ${gym.billingInfo?.regards || gym.gymName}`;
    sendWhatsApp({ phone: client.personalInfo.mobileNo, message: billMessage }).catch(console.error);

    await syncClientStatus(client._id);

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all payments for a gym
// @route   GET /api/payment
// @access  Private (Owner, Admin)
exports.getPayments = async (req, res, next) => {
  try {
    let gymIdStr = req.userRole === 'owner' ? req.user.gymId : req.query.gymId;
    const payments = await Payment.find({ gymId: gymIdStr }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a payment (partial payments)
// @route   PUT /api/payment/:id
// @access  Private (Owner)
exports.updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { additionalAmount } = req.body;
    const gymIdStr = req.user.gymId;

    const payment = await Payment.findOne({ _id: id, gymId: gymIdStr });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    const addedAmount = Number(additionalAmount) || 0;
    if (addedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Additional amount must be greater than zero' });
    }

    payment.paidAmount += addedAmount;

    if (payment.paidAmount >= payment.amount) {
      payment.paidAmount = payment.amount;
      payment.status = 'paid';
    } else {
      payment.status = 'partial';
    }

    await payment.save();

    // Sync back to client memberships
    const client = await Client.findById(payment.clientId);
    if (client && client.memberships) {
      // Find the membership matching this payment's plan and start date
      const mIdx = client.memberships.findIndex(m => 
        m.planId.toString() === payment.planId.toString() && 
        new Date(m.startDate).getTime() === new Date(payment.startDate).getTime()
      );

      if (mIdx !== -1) {
        client.memberships[mIdx].totalPaid += addedAmount;
        // Also update legacy field if it matches
        if (client.membership && client.membership.planId.toString() === payment.planId.toString()) {
          client.membership.totalPaid = (client.membership.totalPaid || 0) + addedAmount;
        }
        await client.save();
      }
    }

    await syncClientStatus(payment.clientId);

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

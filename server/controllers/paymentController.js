const Payment = require('../models/Payment');
const Client = require('../models/Client');
const Gym = require('../models/Gym');
const { generatePaymentId } = require('../utils/generateId');
const sendWhatsApp = require('../utils/sendWhatsApp');
const { buildMembershipWindow } = require('../utils/membership');

// @desc    Record Payment
// @route   POST /api/payment
// @access  Private (Owner)
exports.recordPayment = async (req, res, next) => {
  try {
    const { clientId, planId, amount, mode } = req.body;
    const gymIdStr = req.user.gymId;

    const client = await Client.findOne({ _id: clientId, gymId: gymIdStr }).populate('membership.planId');
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    const gym = await Gym.findById(gymIdStr);
    
    const paymentId = await generatePaymentId(gymIdStr, gym.billingInfo?.billingIdPrefix || 'BILL');

    const payment = await Payment.create({
      paymentId,
      gymId: gymIdStr,
      clientId: client._id,
      clientName: client.personalInfo.name,
      planId,
      planName: client.membership.planName, // Assuming plan stays same or pass as param
      amount,
      mode,
      date: new Date(),
      billSentViaWhatsApp: false
    });

    // Update Client Membership
    client.paymentHistory.push(payment._id);
    
    // Set to active and update expiration Date
    // If requestApproved was false, make it true
    client.membership.status = 'active';
    client.membership.requestApproved = true;
    
    // Fetch plan details to calculate days
    const Plan = require('../models/Plan');
    const planDetails = await Plan.findById(planId);
    if(planDetails) {
       client.membership.planName = planDetails.name;
       client.membership.planId = planId;
       client.membership.planDurationMonths = planDetails.durationMonths;
       client.membership.durationMonths = planDetails.durationMonths; // backward compat

       const membershipWindow = buildMembershipWindow({
         startDate: new Date(),
         durationMonths: planDetails.durationMonths
       });

       client.membership.startDate = membershipWindow.startDate;
       client.membership.endDate = membershipWindow.endDate;
       client.membership.daysLeft = membershipWindow.daysLeft;
       client.membership.status = membershipWindow.status;
    }

    await client.save();

    // Send Bill via WhatsApp
    payment.billSentViaWhatsApp = true;
    await payment.save();

    const billMessage = `Hello ${client.personalInfo.name}, your payment of ₹${amount} for ${client.membership.planName} is received. Receipt No: ${paymentId}. Regards, ${gym.billingInfo?.regards || gym.gymName}`;
    await sendWhatsApp({ phone: client.personalInfo.mobileNo, message: billMessage });

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
    const payments = await Payment.find({ gymId: gymIdStr }).sort({ date: -1 });
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    next(err);
  }
};

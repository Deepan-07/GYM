const Client = require('../models/Client');
const Payment = require('../models/Payment');
const { buildMembershipWindow } = require('./membership');

const syncClientStatus = async (clientId) => {
  try {
    const client = await Client.findById(clientId);
    if (!client) return null;

    // First check if any pending or partial payments are actually overdue right now
    const pastDuePayments = await Payment.find({
      clientId: client._id,
      status: { $in: ['pending', 'partial'] },
      dueDate: { $lt: new Date() }
    });

    // Update those payments to 'overdue' if they slipped past the cron
    for (let p of pastDuePayments) {
      p.status = 'overdue';
      await p.save();
    }

    // Now check if the client has any overdue payments
    const overduePayment = await Payment.findOne({
      clientId: client._id,
      status: 'overdue'
    });

    const partialPayment = await Payment.findOne({
      clientId: client._id,
      status: 'partial'
    });

    if (overduePayment) {
      client.paymentStatus = 'overdue';
    } else if (partialPayment) {
      client.paymentStatus = 'partial';
    } else {
      client.paymentStatus = 'paid';
    }

    // 2. Synchronize Membership (Automatic Continuation)
    // Find the currently active plan, or the next upcoming one if no active exists
    const { currentPlan, nextPlan } = require('./membership').getClientPlans(client.memberships || []);
    
    if (currentPlan) {
      client.membership = {
        ...currentPlan,
        requestApproved: true
      };
    } else if (nextPlan && (!client.membership || new Date(client.membership.endDate) < new Date())) {
      // If no active plan, but we have an upcoming one, and the previous one is expired
      // Note: We don't necessarily make it 'Active' here, the getPlanStatus will handle it dynamically.
      // But we update the primary field to point to the next relevant plan.
      client.membership = {
        ...nextPlan,
        requestApproved: true
      };
    }

    await client.save();
    return client;
  } catch (error) {
    console.error('Error syncing client status:', error);
    return null;
  }
};

module.exports = { syncClientStatus };

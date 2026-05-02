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

    await client.save();
    return client;
  } catch (error) {
    console.error('Error syncing client status:', error);
    return null;
  }
};

module.exports = { syncClientStatus };

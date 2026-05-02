const cron = require('node-cron');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const { syncClientStatus } = require('../utils/syncStatus');

// Run every day at 00:05
cron.schedule('* * * * *', async () => {
  console.log('Running statusUpdater job...');
  try {
    // 1. Transition past due payments to overdue
    const pendingPayments = await Payment.find({ 
      status: { $in: ['pending', 'partial'] },
      dueDate: { $lt: new Date() }
    });

    for (let payment of pendingPayments) {
      payment.status = 'overdue';
      await payment.save();
    }

    // 2. Sync client payment statuses
    const clients = await Client.find({ isActive: true });
    for (let client of clients) {
      await syncClientStatus(client._id);
    }

    console.log('statusUpdater job completed.');
  } catch (err) {
    console.error('Error in statusUpdater job:', err);
  }
});

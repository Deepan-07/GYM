require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('./models/Client');
const Payment = require('./models/Payment');
const { syncClientStatus } = require('./utils/syncStatus');

const fixStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');

    const pendingPayments = await Payment.find({ 
      status: { $in: ['pending', 'partial'] },
      dueDate: { $lt: new Date() }
    });

    for (let payment of pendingPayments) {
      payment.status = 'overdue';
      await payment.save();
    }
    console.log(`Updated ${pendingPayments.length} payments to overdue`);

    const clients = await Client.find({ 'membership.requestApproved': true, isActive: true });
    console.log(`Found ${clients.length} active clients. Syncing statuses...`);

    let updatedCount = 0;
    for (let client of clients) {
      const oldStatus = client.membership.status;
      await syncClientStatus(client._id);
      const updatedClient = await Client.findById(client._id);
      if (oldStatus !== updatedClient.membership.status) {
        updatedCount++;
      }
    }
    console.log(`Synced all clients. Changed status for ${updatedCount} clients.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixStatus();

require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('./models/Client');
const { syncClientStatus } = require('./utils/syncStatus');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const clients = await Client.find({});
    console.log(`Found ${clients.length} clients. Migrating memberships...`);

    for (let client of clients) {
      if ((!client.memberships || client.memberships.length === 0) && client.membership && client.membership.startDate) {
        client.memberships = [{
          planId: client.membership.planId,
          planName: client.membership.planName,
          planDurationMonths: client.membership.planDurationMonths || client.membership.durationMonths,
          startDate: client.membership.startDate,
          endDate: client.membership.endDate
        }];
        await client.save();
      }
    }
    console.log('Memberships migrated. Syncing paymentStatuses...');

    for (let client of clients) {
      await syncClientStatus(client._id);
    }

    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();

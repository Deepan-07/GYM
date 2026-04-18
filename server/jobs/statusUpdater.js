const cron = require('node-cron');
const Client = require('../models/Client');
const { buildMembershipWindow } = require('../utils/membership');

// Run every day at 00:05
cron.schedule('5 0 * * *', async () => {
  console.log('Running statusUpdater job...');
  try {
    const clients = await Client.find({ 'membership.requestApproved': true });
    
    for (let client of clients) {
      if (!client.membership.startDate || !client.membership.durationMonths) continue;

      const membershipWindow = buildMembershipWindow({
        startDate: client.membership.startDate,
        durationMonths: client.membership.durationMonths,
        today: new Date()
      });

      client.membership.endDate = membershipWindow.endDate;
      client.membership.daysLeft = membershipWindow.daysLeft;
      client.membership.status = membershipWindow.status;
      await client.save();
    }
    console.log('statusUpdater job completed.');
  } catch (err) {
    console.error('Error in statusUpdater job:', err);
  }
});

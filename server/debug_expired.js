const mongoose = require('mongoose');
const Client = require('./models/Client');
require('dotenv').config();

const debugExpired = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const today = new Date();
  today.setHours(0,0,0,0);
  
  console.log("Today (normalized):", today);
  
  const allClients = await Client.find({ isActive: true });
  console.log(`Total active clients: ${allClients.length}`);
  
  allClients.forEach(c => {
    console.log(`\nClient: ${c.personalInfo.name}`);
    console.log(`- Legacy EndDate: ${c.membership?.endDate}`);
    console.log(`- Memberships Count: ${c.memberships?.length || 0}`);
    if (c.memberships) {
      c.memberships.forEach((m, i) => {
        console.log(`  [${i}] ${m.planName}: ${m.startDate} to ${m.endDate}`);
      });
    }
  });

  const expiredQuery = {
    isActive: true,
    'membership.endDate': { $lt: today }
  };
  
  const expiredClients = await Client.find(expiredQuery);
  console.log(`\nFound ${expiredClients.length} expired clients with current query.`);
  
  process.exit(0);
};

debugExpired();

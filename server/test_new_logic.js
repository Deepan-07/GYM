const mongoose = require('mongoose');
const Client = require('./models/Client');
const { getPlanStatus } = require('./utils/membership');
require('dotenv').config();

const testNewExpiredLogic = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const gymIdStr = 'NEX-04';
  const clients = await Client.find({ 
    gymId: gymIdStr, 
    isActive: true 
  });

  const expiredClients = clients.filter(client => {
    const memberships = client.memberships || (client.membership?.startDate ? [client.membership] : []);
    if (memberships.length === 0) return false;

    const hasActiveOrUpcoming = memberships.some(m => {
      const status = getPlanStatus(m, today);
      return status === 'Active' || status === 'Upcoming';
    });

    return !hasActiveOrUpcoming;
  });

  console.log(`New Logic Found ${expiredClients.length} expired clients for NEX-04.`);
  expiredClients.forEach(c => console.log(`- ${c.personalInfo.name}`));
  
  process.exit(0);
};

testNewExpiredLogic();

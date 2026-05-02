const mongoose = require('mongoose');
const Client = require('./models/Client');
require('dotenv').config();

const checkGymClients = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const gymId = 'NEX-04';
  const clients = await Client.find({ gymId, isActive: true });
  
  console.log(`Clients for NEX-04: ${clients.length}`);
  clients.forEach(c => {
    const expired = c.membership?.endDate && new Date(c.membership.endDate) < today;
    console.log(`Client: ${c.personalInfo.name}, EndDate: ${c.membership?.endDate}, Expired: ${expired}`);
  });
  
  process.exit(0);
};

checkGymClients();

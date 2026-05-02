const mongoose = require('mongoose');
const Client = require('./models/Client');
require('dotenv').config();

const checkLatestClients = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  
  const clients = await Client.find({}).sort({ createdAt: -1 }).limit(5);
  
  console.log(`Found ${clients.length} latest clients:`);
  clients.forEach(c => {
    console.log(`- Name: ${c.personalInfo.name}, Email: ${c.personalInfo.email}, GymID: ${c.gymId}, CreatedAt: ${c.createdAt}`);
  });
  
  process.exit(0);
};

checkLatestClients();

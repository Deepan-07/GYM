const mongoose = require('mongoose');
const Client = require('./models/Client');
require('dotenv').config();

const checkYalini = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const client = await Client.findOne({ 'personalInfo.name': 'yalini' });
  if (client) {
    console.log(`Client: ${client.personalInfo.name}`);
    console.log(`PaymentHistory: ${JSON.stringify(client.paymentHistory)}`);
  } else {
    console.log('Client yalini not found');
  }
  process.exit(0);
};

checkYalini();

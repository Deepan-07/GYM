const mongoose = require('mongoose');
const Gym = require('./models/Gym');
require('dotenv').config();

const findGyms = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const gyms = await Gym.find({});
  gyms.forEach(g => {
    console.log(`Gym: ${g.gymName}, ID: ${g.gymId}`);
  });
  process.exit(0);
};

findGyms();

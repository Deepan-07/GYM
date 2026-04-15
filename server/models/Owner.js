const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
  name: { type: String, required: true },
  mobileNo: { type: String, required: true },
  mailId: { type: String, required: true },
  role: { type: String, default: 'Owner' }
}, { timestamps: true });

module.exports = mongoose.model('Owner', ownerSchema);

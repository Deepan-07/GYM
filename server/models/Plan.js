const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  gymId: { type: String, required: true },
  name: { type: String, required: true },
  durationMonths: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  isCustom: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);

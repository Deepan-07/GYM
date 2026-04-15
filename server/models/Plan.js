const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  gymId: { type: String, required: true },
  planName: { type: String, required: true },
  durationDays: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);

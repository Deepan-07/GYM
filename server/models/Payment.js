const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, unique: true },
  gymId: { type: String, required: true },
  clientId: { type: String, required: true },
  clientName: { type: String },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  planName: { type: String },
  amount: { type: Number, required: true },
  mode: { type: String, enum: ['cash', 'online'] },
  date: { type: Date, default: Date.now },
  billSentViaWhatsApp: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

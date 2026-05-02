const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, unique: true },
  gymId: { type: String, required: true },
  clientId: { type: String, required: true },
  clientName: { type: String },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  planName: { type: String },
  amount: { type: Number, required: true },
  paidAmount: { type: Number },
  status: { type: String, enum: ['pending', 'partial', 'paid', 'overdue'] },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'card'] },
  mode: { type: String }, // For backward compatibility
  paymentDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  startDate: { type: Date },
  isPlanActivated: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }, // For backward compatibility
  billSentViaWhatsApp: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

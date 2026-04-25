const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientSchema = new mongoose.Schema({
  clientId: { type: String, unique: true, sparse: true, trim: true },
  gymId: { type: String, required: true },
  gymName: { type: String, required: true },
  personalInfo: {
    name: { type: String, required: true, maxlength: 20 },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, unique: true },
    mobileNo: { type: String, required: true, unique: true },
    emergencyContact: { type: String },
    medicalCondition: { type: String, maxlength: 100 }
  },
  password: { type: String, required: true },
  membership: {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    planName: { type: String },
    planDurationMonths: { type: Number },
    customMonths: { type: Number },
    durationMonths: { type: Number }, // Keeping for backward compatibility
    startDate: { type: Date },
    endDate: { type: Date },
    daysLeft: { type: Number },
    status: {
      type: String,
      enum: ['active', 'expiring_soon', 'expired', 'overdue', 'pending', 'upcoming'],
      default: 'pending'
    },
    requestApproved: { type: Boolean, default: false }
  },
  paymentHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  deactivatedAt: { type: Date, default: null }
}, { timestamps: true });

clientSchema.index({ gymId: 1, clientId: 1 }, { unique: true, sparse: true });

clientSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

clientSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Client', clientSchema);

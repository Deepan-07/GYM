const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const gymSchema = new mongoose.Schema({
  gymId: { type: String, required: true, unique: true, trim: true },
  gymIdPrefix: { type: String },
  gymName: { type: String, required: true },
  gst: { type: String },
  tagline: { type: String },
  address: { type: String, required: true },
  location: { type: String, required: true },
  gymEmail: { type: String, required: true },
  gymContact: { type: String, required: true },
  socialMediaLinks: [{ platform: String, url: String }],
  gymType: { type: String },
  operatingDays: [{ type: String }],
  operatingHours: {
    open: { type: String },
    close: { type: String }
  },
  password: { type: String, required: true },
  billingInfo: {
    billingIdPrefix: String,
    helpContact: String,
    gst: String,
    logo: String,
    addressOnBill: String,
    regards: String,
    greetingText: String
  },
  reminderSettings: {
    whatsappNumber: String,
    gmail: String,
    phoneNumber: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

gymSchema.index({ gymId: 1 }, { unique: true });

gymSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

gymSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Gym', gymSchema);

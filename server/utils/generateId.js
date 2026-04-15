const Gym = require('../models/Gym');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const Counter = require('../models/Counter');

const getNextSequenceValue = async (name) => {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { value: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  return counter.value;
};

const generateGymId = async (prefix) => {
  const clean = prefix.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const sequence = await getNextSequenceValue('gymId');
  return `${clean}-${String(sequence).padStart(2, '0')}`;
};

const generateClientId = async (gymIdStr) => {
  const gym = await Gym.findOne({ gymId: gymIdStr });
  const prefix = gym?.gymIdPrefix?.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (!prefix) {
    throw new Error('Unable to generate client ID for this gym');
  }

  const sequence = await getNextSequenceValue(`clientId:${gymIdStr}`);
  return `${prefix}-${String(sequence).padStart(4, '0')}`;
};

const generatePaymentId = async (gymId, billingPrefix) => {
  const paymentsCount = await Payment.countDocuments({ gymId });
  const count = paymentsCount + 1;
  const paddedCount = count.toString().padStart(4, '0');
  return `${billingPrefix}-${paddedCount}`;
};

module.exports = { generateGymId, generateClientId, generatePaymentId, getNextSequenceValue };

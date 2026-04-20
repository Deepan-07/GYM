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

const generateGymId = async () => {
  const prefix = 'NEX';

  // 1. Ensure concurrency safety using an atomic counter
  const counterName = 'NEX_GYM_SEQUENCE';
  let sequence = await getNextSequenceValue(counterName);

  // 2. To handle existing data (last count = 5) and ensure continuity:
  // Fetch the latest gymId starting with NEX- to verify the counter is in sync
  const lastGym = await Gym.findOne({ gymId: new RegExp(`^${prefix}-`) }).sort({ gymId: -1 });
  
  let lastCount = 0;
  if (lastGym && lastGym.gymId) {
    const parts = lastGym.gymId.split('-');
    lastCount = parseInt(parts[1], 10) || 0;
  }

  // 3. If counter is behind existing records, fast-forward it
  if (sequence <= lastCount) {
    const correctedCounter = await Counter.findOneAndUpdate(
      { name: counterName },
      { $set: { value: lastCount + 1 } },
      { new: true, upsert: true }
    );
    sequence = correctedCounter.value;
  }

  return `${prefix}-${String(sequence).padStart(2, '0')}`;
};

const generateClientId = async (gymIdStr) => {
  const gym = await Gym.findOne({ gymId: gymIdStr });
  const prefix = gym?.gymIdPrefix?.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (!prefix) {
    throw new Error('Unable to generate client ID for this gym');
  }

  const sequence = await getNextSequenceValue(`clientId:${gymIdStr}`);
  return `${prefix}-${String(sequence).padStart(2, '0')}`;
};

const generatePaymentId = async (gymId, billingPrefix) => {
  const paymentsCount = await Payment.countDocuments({ gymId });
  const count = paymentsCount + 1;
  const paddedCount = count.toString().padStart(4, '0');
  return `${billingPrefix}-${paddedCount}`;
};

module.exports = { generateGymId, generateClientId, generatePaymentId, getNextSequenceValue };

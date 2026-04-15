const Gym = require('../models/Gym');
const Owner = require('../models/Owner');
const Client = require('../models/Client');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { generateGymId, generateClientId } = require('../utils/generateId');
const Plan = require('../models/Plan');

const parseJsonField = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const buildLogoPath = (file) => file ? `/uploads/logos/${file.filename}` : '';

const generateToken = (id, role, extra = {}) => {
  return jwt.sign({ id, role, ...extra }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register a new Gym Owner
// @route   POST /api/auth/gym/register
// @access  Public
exports.registerGymOwner = async (req, res, next) => {
  try {
    const {
      gymIdPrefix, gymName, gst, tagline, address, location, gymEmail, gymContact, socialMediaLinks, gymType, operatingDays, operatingHours, password,
      name, mobileNo, mailId, role = 'Owner',
      whatsappNumber, gmail, phoneNumber,
      billingIdPrefix, helpContact, addressOnBill, regards, greetingText
    } = req.body;

    const gymExists = await Gym.findOne({ gymEmail });
    if (gymExists) return res.status(400).json({ success: false, message: 'Gym with this email already exists' });

    const newGymId = await generateGymId(gymIdPrefix);

    const gym = await Gym.create({
      gymId: newGymId,
      gymIdPrefix,
      gymName,
      gst,
      tagline,
      address,
      location,
      gymEmail,
      gymContact,
      socialMediaLinks: parseJsonField(socialMediaLinks, []).filter((item) => item?.platform && item?.url),
      gymType,
      operatingDays: parseJsonField(operatingDays, []),
      operatingHours: parseJsonField(operatingHours, {}),
      password,
      billingInfo: {
        billingIdPrefix,
        helpContact,
        gst,
        logo: buildLogoPath(req.file),
        addressOnBill,
        regards,
        greetingText
      },
      reminderSettings: { whatsappNumber, gmail, phoneNumber }
    });

    const owner = await Owner.create({
      gymId: gym._id,
      name, mobileNo, mailId, role
    });

    res.status(201).json({
      success: true,
      message: 'Gym registered successfully',
      data: { 
        gymId: newGymId,
        gymName: gym.gymName,
        token: generateToken(gym._id, 'owner', { gymId: newGymId, gymName: gym.gymName })
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login Gym Owner
// @route   POST /api/auth/gym/login
// @access  Public
exports.loginGymOwner = async (req, res, next) => {
  try {
    const { gymId, gymName, phone, password } = req.body;
    const gym = await Gym.findOne({ gymId, gymName, gymContact: phone });

    if (gym && (await gym.matchPassword(password))) {
      res.json({
        success: true,
        data: gym,
        token: generateToken(gym._id, 'owner', { gymId: gym.gymId, gymName: gym.gymName })
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Register a new Client
// @route   POST /api/auth/client/register
// @access  Public
exports.registerClient = async (req, res, next) => {
  try {
    const {
      gymId, name, dob, gender, address, email, mobileNo, emergencyContact, medicalCondition, password,
      planId, startDate
    } = req.body;

    const gymExists = await Gym.findOne({ gymId });
    if (!gymExists) return res.status(400).json({ success: false, message: 'Gym not found' });

    const clientExists = await Client.findOne({ gymId, 'personalInfo.email': email });
    if (clientExists) return res.status(400).json({ success: false, message: 'Client with this email already registered in this gym' });

    const plan = await Plan.findOne({ _id: planId, gymId, isActive: true });
    if (!plan) return res.status(400).json({ success: false, message: 'Selected plan not found' });

    const client = await Client.create({
      gymId,
      gymName: gymExists.gymName,
      personalInfo: { name, dob, gender, address, email, mobileNo, emergencyContact, medicalCondition },
      password,
      membership: {
        planId,
        planName: plan.planName,
        startDate,
        status: 'pending',
        requestApproved: false
      },
      avatar: name.charAt(0).toUpperCase()
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully',
      data: { client }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login Client
// @route   POST /api/auth/client/login
// @access  Public
exports.loginClient = async (req, res, next) => {
  try {
    const { gymId, gymName, clientId, mobileNo, password } = req.body;
    const client = await Client.findOne({ gymId, gymName, clientId, 'personalInfo.mobileNo': mobileNo });

    if (client && (await client.matchPassword(password))) {
      if (!client.membership.requestApproved) {
         return res.status(401).json({ success: false, message: 'Your membership is pending approval by the gym owner' });
      }

      res.json({
        success: true,
        data: client,
        token: generateToken(client._id, 'client')
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Login Super Admin
// @route   POST /api/auth/admin/login
// @access  Public
exports.loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        success: true,
        data: { email: admin.email, role: admin.role },
        token: generateToken(admin._id, 'superadmin')
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    next(err);
  }
};

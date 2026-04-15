const jwt = require('jsonwebtoken');
const Gym = require('../models/Gym');
const Client = require('../models/Client');
const Admin = require('../models/Admin');
const Owner = require('../models/Owner');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      let user = null;
      let role = null;

      // Determine user type based on token role embedded during authentication
      if (decoded.role === 'client') {
        user = await Client.findById(decoded.id).select('-password');
        role = 'client';
      } else if (decoded.role === 'owner') {
        user = await Gym.findById(decoded.id).select('-password');
        if(!user) {
           // Also fetch owner separately if needed or link to gym.
           // Because Gym is the entity logging in, but it belongs to an Owner account.
           // However, login specs say for owner: "GYM OWNER LOGIN: gymId + gymName + phone + password"
           // It logs into the Gym document itself or Owner. Let's use Gym as user.
        }
        role = 'owner';
      } else if (decoded.role === 'superadmin') {
        user = await Admin.findById(decoded.id).select('-password');
        role = 'superadmin';
      }

      if (!user) {
         return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      req.user = user;
      req.userRole = role;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ success: false, message: `User role ${req.userRole} is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { protect, authorize };

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

router.route('/')
  .post(protect, authorize('owner'), paymentController.recordPayment)
  .get(protect, authorize('owner', 'superadmin'), paymentController.getPayments);

module.exports = router;

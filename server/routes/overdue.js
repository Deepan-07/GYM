const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const overdueController = require('../controllers/overdueController');

router.get('/', protect, authorize('owner'), overdueController.getOverdueClients);
router.get('/expired', protect, authorize('owner'), overdueController.getExpiredClients);

module.exports = router;

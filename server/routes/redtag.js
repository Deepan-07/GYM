const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const redtagController = require('../controllers/redtagController');

router.get('/', protect, authorize('owner'), redtagController.getRedTagClients);
router.get('/expired', protect, authorize('owner'), redtagController.getExpiredClients);

module.exports = router;

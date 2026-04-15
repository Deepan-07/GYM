const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const planController = require('../controllers/planController');

// All plan routes need authentication, though getPlans could be public for registration
router.route('/')
  .post(protect, authorize('owner'), planController.createPlan)
  .get(protect, planController.getPlans); // clients and owners can see plans

// Public route to fetch plans for registration form by gymId
// Adding a special public route just in case
router.get('/public/:gymId', async (req, res, next) => {
  try {
    const Plan = require('../models/Plan');
    const plans = await Plan.find({ gymId: req.params.gymId, isActive: true });
    res.status(200).json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
});

router.route('/:id')
  .put(protect, authorize('owner'), planController.updatePlan)
  .delete(protect, authorize('owner'), planController.deletePlan);

module.exports = router;

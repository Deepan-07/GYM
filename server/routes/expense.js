const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');

router.use(protect);
router.use(authorize('owner'));

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;

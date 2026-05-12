const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');

const { uploadBill } = require('../middleware/upload');

router.use(protect);
router.use(authorize('owner'));

router.route('/')
  .get(getExpenses)
  .post(uploadBill.single('billImage'), createExpense);

router.route('/:id')
  .put(uploadBill.single('billImage'), updateExpense)
  .delete(deleteExpense);

module.exports = router;

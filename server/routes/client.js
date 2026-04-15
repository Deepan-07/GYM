const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const clientController = require('../controllers/clientController');

router.get('/profile', protect, authorize('client'), clientController.getClientProfile);
router.put('/profile', protect, authorize('client'), clientController.updateClientProfile);

router.route('/')
  .get(protect, authorize('owner', 'superadmin'), clientController.getClients)
  .post(protect, authorize('owner'), clientController.addClient);

router.route('/:id')
  .get(protect, authorize('owner', 'superadmin'), clientController.getClientById)
  .delete(protect, authorize('owner'), clientController.deleteClient);

router.put('/:id/approve', protect, authorize('owner'), clientController.approveClient);

module.exports = router;

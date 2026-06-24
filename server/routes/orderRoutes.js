const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment, // <--- Import this
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelMyOrder,
  updateOrderToPaid
} = require('../controllers/orderController');

// Import our middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// --- User Routes ---
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.put('/:id/cancel', protect, cancelMyOrder);
router.get('/:id', protect, getOrderById);

// --- Payment Verification Route (Called by Frontend after PayMongo redirect) ---
router.put('/:id/verify-payment', protect, verifyPayment);

// --- Admin/Superadmin Routes ---
router.get('/', protect, authorize('Admin', 'Superadmin'), getAllOrders);

// Update an order's status
router.put(
  '/:id/status',
  protect,
  authorize('Admin', 'Superadmin'),
  updateOrderStatus
);

// Mark as paid (Admin manual override)
router.put(
  '/:id/pay',
  protect,
  authorize('Admin', 'Superadmin'),
  updateOrderToPaid
);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getReservationById,
  getAllReservations,
  updateReservationStatus,
} = require('../controllers/reservationController');

// Import our middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// --- User Routes ---
// Create a new reservation
router.post('/', protect, createReservation);

// Get the logged-in user's reservations
router.get('/my-reservations', protect, getMyReservations);

// Get a specific reservation by ID
router.get('/:id', protect, getReservationById);

// --- Admin/Superadmin Routes ---

// Get all reservations from all users
router.get(
  '/',
  protect,
  authorize('Admin', 'Superadmin'),
  getAllReservations
);

// Update a reservation's status (or down payment)
router.put(
  '/:id/status',
  protect,
  authorize('Admin', 'Superadmin'),
  updateReservationStatus
);

module.exports = router;
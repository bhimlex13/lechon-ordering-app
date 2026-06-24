const Reservation = require('../models/reservationModel');

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Private (Logged-in User)
const createReservation = async (req, res) => {
  try {
    const {
      reservationType,
      reservationDate,
      timeSlot,
      branch,
      numberOfGuests,
      lechonSize,
      notes,
    } = req.body;

    // --- Basic Validation ---
    if (!reservationType || !reservationDate || !timeSlot || !branch) {
      return res
        .status(400)
        .json({ message: 'Missing required reservation fields' });
    }

    [cite_start]// Validation specific to 'Lechon' reservation [cite: 501-502]
    if (reservationType === 'Lechon' && !lechonSize) {
      return res.status(400).json({ message: 'Lechon size is required' });
    }
    // Validation specific to 'Dine-in' reservation
    if (reservationType === 'Dine-in' && !numberOfGuests) {
      return res
        .status(400)
        .json({ message: 'Number of guests is required' });
    }
    // --- End Validation ---

    const reservation = new Reservation({
      user: req.user._id, // From 'protect' middleware
      reservationType,
      reservationDate,
      timeSlot,
      branch,
      numberOfGuests:
        reservationType === 'Dine-in' ? numberOfGuests : undefined,
      lechonSize: reservationType === 'Lechon' ? lechonSize : undefined,
      notes,
      // Status defaults to 'Pending'
      // isDownPaymentPaid defaults to false
    });

    const createdReservation = await reservation.save();
    res.status(201).json(createdReservation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reservations for the logged-in user
// @route   GET /api/reservations/my-reservations
// @access  Private (Logged-in User)
const getMyReservations = async (req, res) => {
  try {
    // Find reservations matching the logged-in user's ID
    const reservations = await Reservation.find({ user: req.user._id }).sort({
      reservationDate: -1,
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single reservation by ID
// @route   GET /api/reservations/:id
// @access  Private (User or Admin/Superadmin)
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user is Admin/Superadmin OR if the reservation belongs to them
    if (
      req.user.role === 'Admin' ||
      req.user.role === 'Superadmin' ||
      reservation.user._id.equals(req.user._id)
    ) {
      res.json(reservation);
    } else {
      res
        .status(403)
        .json({ message: 'Not authorized to view this reservation' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- ADMIN/SUPERADMIN ROUTES ---

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private (Admin, Superadmin)
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({})
      .populate('user', 'id name')
      .sort({ reservationDate: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private (Admin, Superadmin)
const updateReservationStatus = async (req, res) => {
  try {
    const { status, isDownPaymentPaid } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (status) {
      const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status: ${status}` });
      }
      reservation.status = status;
    }

    // Allow updating down payment status (e.g., for lechon)
    if (isDownPaymentPaid !== undefined) {
      reservation.isDownPaymentPaid = isDownPaymentPaid;
    }

    const updatedReservation = await reservation.save();
    res.json(updatedReservation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getReservationById,
  getAllReservations,
  updateReservationStatus,
};
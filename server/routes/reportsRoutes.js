const express = require('express');
const router = express.Router();
const { getReportsSummary } = require('../controllers/reportsController');

// Import our middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Admin/Superadmin Only Routes ---

// Get the main sales/reservation summary report
router.get(
  '/summary',
  protect,
  authorize('Admin', 'Superadmin'),
  getReportsSummary
);

module.exports = router;
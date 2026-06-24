const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuItemController');

// Import our middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Public Routes ---
// Get all menu items
router.get('/', getMenuItems);
// Get a single menu item by ID
router.get('/:id', getMenuItemById);

// --- Admin/Superadmin-Only Routes ---

// Create a new menu item
router.post(
  '/',
  protect, // 1. Check if user is logged in
  authorize('Admin', 'Superadmin'), // 2. Check if user is Admin or Superadmin
  createMenuItem
);

// Update an existing menu item
router.put(
  '/:id',
  protect,
  authorize('Admin', 'Superadmin'),
  updateMenuItem
);

// Delete a menu item
router.delete(
  '/:id',
  protect,
  authorize('Admin', 'Superadmin'),
  deleteMenuItem
);

module.exports = router;
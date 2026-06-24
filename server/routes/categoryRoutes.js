const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory, // <-- ADD THIS
  deleteCategory,
} = require('../controllers/categoryController');

// Import our middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Public Route ---
// Get all categories (for the dropdown)
router.get('/', getCategories);

// --- Admin/Superadmin-Only Routes ---

// Create a new category
router.post(
  '/',
  protect,
  authorize('Admin', 'Superadmin'),
  createCategory
);

// Update a category
router.put(
  '/:id', // <-- ADD THIS ROUTE
  protect,
  authorize('Admin', 'Superadmin'),
  updateCategory
);

// Delete a category
router.delete(
  '/:id',
  protect,
  authorize('Admin', 'Superadmin'),
  deleteCategory
);

module.exports = router;
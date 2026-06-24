const Category = require('../models/categoryModel');

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public (or Admin)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private (Admin, Superadmin)
const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({ name });
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin, Superadmin)
const updateCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if another category with the new name already exists
    const categoryExists = await Category.findOne({ name });
    if (categoryExists && categoryExists._id.toString() !== req.params.id) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    // Update the name and save
    category.name = name;
    const updatedCategory = await category.save();

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin, Superadmin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      // TODO: We should first check if any MenuItem is using this category
      // For now, we'll just delete it.
      await category.deleteOne();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory, // <-- ADD THIS
  deleteCategory,
};
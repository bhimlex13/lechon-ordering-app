const MenuItem = require('../models/menuItemModel');

// @desc    Fetch all menu items
// @route   GET /api/menu
const getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({});
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Fetch a single menu item by ID
// @route   GET /api/menu/:id
const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (menuItem) {
      res.json(menuItem);
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- ADMIN/SUPERADMIN ROUTES ---

// @desc    Create a new menu item
// @route   POST /api/menu
const createMenuItem = async (req, res) => {
  // ADDED goodFor and cookedWeight to destructuring
  const { name, description, price, category, imageUrl, availability, goodFor, cookedWeight } = req.body;

  try {
    const menuItem = new MenuItem({
      name,
      description,
      price,
      category,
      imageUrl: imageUrl || '/images/placeholder.png',
      availability: availability || true,
      goodFor: goodFor || '',           // <-- NEW
      cookedWeight: cookedWeight || ''  // <-- NEW
    });

    const createdMenuItem = await menuItem.save();
    res.status(201).json(createdMenuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update an existing menu item
// @route   PUT /api/menu/:id
const updateMenuItem = async (req, res) => {
  // ADDED goodFor and cookedWeight
  const { name, description, price, category, imageUrl, availability, goodFor, cookedWeight } = req.body;

  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (menuItem) {
      menuItem.name = name || menuItem.name;
      menuItem.description = description || menuItem.description;
      menuItem.price = price === undefined ? menuItem.price : price;
      menuItem.category = category || menuItem.category;
      menuItem.imageUrl = imageUrl || menuItem.imageUrl;
      menuItem.availability = availability === undefined ? menuItem.availability : availability;
      
      // --- NEW FIELDS ---
      if (goodFor !== undefined) menuItem.goodFor = goodFor;
      if (cookedWeight !== undefined) menuItem.cookedWeight = cookedWeight;

      const updatedMenuItem = await menuItem.save();
      res.json(updatedMenuItem);
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (menuItem) {
      await menuItem.deleteOne();
      res.json({ message: 'Menu item removed' });
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
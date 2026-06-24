const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load Models
const MenuItem = require('./models/menuItemModel');
const User = require('./models/userModel');
// We can import User, Order, etc., if we want to seed them too

// Load env vars
dotenv.config();

// --- COPY YOUR MOCK DATA HERE ---
// (I've copied this from your mock-data.js file)
const mockMenuItems = [
  {
    name: 'Lechon Paksiw',
    description: 'Classic tangy and savory lechon stew.',
    price: 295.0,
    category: 'Main Course',
    imageUrl: '/images/lechon_paksiw.png',
  },
  {
    name: 'Crispy Kare-Kare',
    description: 'Crispy pork with rich peanut sauce.',
    price: 345.0,
    category: 'Main Course',
    imageUrl: '/images/crispy_kare_kare.png',
  },
  {
    name: 'Sinigang na Baboy',
    description: 'Tangy and savory tamarind-based pork soup.',
    price: 275.0,
    category: 'Main Course',
    imageUrl: '/images/lechon_paksiw.png',
  },
  {
    name: 'Steamed Pampano',
    description: 'Fresh pampano fish steamed to perfection.',
    price: 565.0,
    category: 'Seafoods',
    imageUrl: '/images/seafood.png',
  },
  {
    name: 'Shrimp Thermidor',
    description: 'Creamy and cheesy baked shrimp.',
    price: 365.0,
    category: 'Seafoods',
    imageUrl: '/images/seafood.png',
  },
  {
    name: 'Lumpiang Shanghai',
    description: 'Crispy fried spring rolls with dipping sauce.',
    price: 290.0,
    category: 'Appetizer',
    imageUrl: '/images/appetizer.png',
  },
];
// --- END OF MOCK DATA ---


// Function to import data
const importData = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Clear existing data
        await User.deleteMany();
    await User.create([
      { name: 'Admin User', email: 'admin@crispylechonhouse.example', password: 'password123', role: 'Admin' },
      { name: 'Customer User', email: 'customer@example.com', password: 'password123', role: 'Customer' }
    ]);
    await MenuItem.deleteMany();

    // Insert new data
    await MenuItem.insertMany(mockMenuItems);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

// Function to destroy data
const destroyData = async () => {
  try {
    await connectDB();
        await User.deleteMany();
    await User.create([
      { name: 'Admin User', email: 'admin@crispylechonhouse.example', password: 'password123', role: 'Admin' },
      { name: 'Customer User', email: 'customer@example.com', password: 'password123', role: 'Customer' }
    ]);
    await MenuItem.deleteMany();
    console.log('Data Destroyed Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data destruction: ${error.message}`);
    process.exit(1);
  }
};

// Check for command-line arguments
if (process.argv[2] === '-d') {
  // If the argument is '-d' (destroy)
  destroyData();
} else {
  // Otherwise, import data by default
  importData();
}



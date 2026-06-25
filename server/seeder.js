const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load Models
const MenuItem = require('./models/menuItemModel');
const User = require('./models/userModel');
// We can import User, Order, etc., if we want to seed them too

const { allMenuItems } = require('./data/seedData');

// Load env vars
dotenv.config();

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
    await MenuItem.insertMany(allMenuItems);

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

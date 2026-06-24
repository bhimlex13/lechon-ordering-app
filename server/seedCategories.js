const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const Category = require('./models/categoryModel');

dotenv.config({ path: path.join(__dirname, '.env') });

const categoriesToSeed = [
  { name: 'Lechon' },
  { name: 'Pork' },
  { name: 'Chicken' },
  { name: 'Beef' },
  { name: 'Seafood' },
  { name: 'Appetizer' },
  { name: 'Dessert' },
  { name: 'Beverage' },
  { name: 'Extras' }
];

const seedCategories = async () => {
  try {
    await connectDB();
    await Category.deleteMany(); // Clear existing categories
    console.log('Old categories cleared...');

    await Category.insertMany(categoriesToSeed);
    console.log('Categories Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedCategories();

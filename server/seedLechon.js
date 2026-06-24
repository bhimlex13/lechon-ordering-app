const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
// Use your existing connection file like seeder.js does
const connectDB = require('./config/db'); 
const MenuItem = require('./models/menuItemModel'); 

// Load env vars
// We keep this path strategy because your log confirmed it found 'server/.env'
dotenv.config({ path: path.join(__dirname, '.env') });

// Sample Data
const lechonData = [
  {
    name: "Cochiñillo (Oven Roasted)",
    price: 10800,
    category: "Lechon",
    goodFor: "8-10 pax",
    cookedWeight: "Approx. 3-4 Kg",
    description: "Our tender, oven-roasted cochiñillo, perfectly crispy.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  },
  {
    name: "Whole Lechon (De Leche)",
    price: 12800,
    category: "Lechon",
    goodFor: "12-15 pax",
    cookedWeight: "Approx. 5-6 Kgs.",
    description: "Succulent whole lechon, tender and juicy.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  },
  {
    name: "Whole Lechon (Small)",
    price: 14800,
    category: "Lechon",
    goodFor: "20-25 pax",
    cookedWeight: "Approx. 8-11kgs",
    description: "Small-sized whole lechon, perfect for intimate gatherings.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  },
  {
    name: "Whole Lechon (Medium)",
    price: 17800,
    category: "Lechon",
    goodFor: "30-40 pax",
    cookedWeight: "Approx. 12-15 Kg",
    description: "Medium-sized whole lechon, a crowd-pleaser for any event.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  },
  {
    name: "Whole Lechon (Large)",
    price: 21800,
    category: "Lechon",
    goodFor: "40-50 pax",
    cookedWeight: "Approx. 16-20 Kg",
    description: "Large whole lechon for bigger celebrations.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  },
  {
    name: "Whole Lechon (X-Large)",
    price: 24800,
    category: "Lechon",
    goodFor: "60-70 pax",
    cookedWeight: "Approx. 21-25 Kg",
    description: "Extra-large whole lechon for grand feasts.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  },
  {
    name: "Whole Lechon (Jumbo)",
    price: 30800,
    category: "Lechon",
    goodFor: "100-120 pax",
    cookedWeight: "Approx. 26-30 kls.",
    description: "Our colossal jumbo lechon, made for the biggest parties.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  },
  {
    name: "Lechon Baka",
    price: 65800,
    category: "Lechon",
    goodFor: "150-200 pax",
    cookedWeight: "Approx. 100-120 Kg",
    description: "Whole roasted beef, a premium lechon experience.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  },
  {
    name: "Petite (Lechon Cebu)",
    price: 9800,
    category: "Lechon",
    goodFor: "8-10 pax",
    cookedWeight: "Approx. 3-4 kgs.",
    description: "Our classic Cebu-style lechon, smaller size.",
    imageUrl: "/images/whole_lechon.png",
    availability: true
  }
];

const importData = async () => {
  try {
    // 1. Connect to DB (This uses process.env.MONGODB_URI inside db.js)
    await connectDB();

    // 2. Delete old Lechon items to avoid duplicates (Optional, but safer for seeding)
    await MenuItem.deleteMany({ category: 'Lechon' });
    console.log('Old Lechon items cleared...');

    // 3. Insert new data
    await MenuItem.insertMany(lechonData);

    console.log('Lechon Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();

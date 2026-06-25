// Import required packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// --- Import Routes ---
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const userRoutes = require('./routes/userRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const settingRoutes = require('./routes/settingRoutes');


// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

// Initialize Express app
const app = express();

// --- TEMPORARY REMOTE SEED ROUTE ---
const MenuItem = require('./models/menuItemModel');
const User = require('./models/userModel');

const { allMenuItems, categoriesToSeed } = require('./data/seedData');
const Category = require('./models/categoryModel');

app.get('/api/seed-db', async (req, res) => {
  try {
    await User.deleteMany();
    await User.create([
      { name: 'Admin User', email: 'admin@crispylechonhouse.example', password: 'password123', role: 'Admin' },
      { name: 'Customer User', email: 'customer@example.com', password: 'password123', role: 'Customer' }
    ]);
    await MenuItem.deleteMany();
    await MenuItem.insertMany(allMenuItems);
    await Category.deleteMany();
    await Category.insertMany(categoriesToSeed);
    res.send('Database Seeded Successfully! You can now close this tab.');
  } catch (err) {
    res.status(500).send('Error seeding database: ' + err.message);
  }
});

// --- Middleware ---
// UPDATED: Allow both Localhost and Production URL
// We create an array of allowed origins. We filter(Boolean) to remove any undefined values if the env var isn't set.
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL 
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Optional: You can log the blocked origin for debugging
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); 

app.get('/', (req, res) => {
  res.send("Crispy Lechon House API is running...");
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingRoutes);

// --- Start the Server ---
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
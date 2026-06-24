const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const Order = require('./models/orderModel');
const User = require('./models/userModel');
const MenuItem = require('./models/menuItemModel');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedOrders = async () => {
  try {
    await connectDB();
    await Order.deleteMany(); // Clear existing
    console.log('Old orders cleared...');

    // Get a user
    const users = await User.find();
    if (users.length === 0) {
        throw new Error('No users found to assign orders to!');
    }
    const customer = users.find(u => u.role === 'Customer') || users[0];

    // Get menu items
    const menuItems = await MenuItem.find();
    if (menuItems.length === 0) {
        throw new Error('No menu items found!');
    }

    const statuses = ['Pending', 'Processing', 'Ready', 'Delivered', 'Cancelled'];
    const mockOrders = [];
    const today = new Date();

    for (let i = 0; i < 25; i++) {
      // Random date within the last 14 days
      const orderDate = new Date(today);
      orderDate.setDate(today.getDate() - Math.floor(Math.random() * 14));

      // Random items
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let totalPrice = 0;

      for (let j = 0; j < numItems; j++) {
        const randomMenu = menuItems[Math.floor(Math.random() * menuItems.length)];
        const qty = Math.floor(Math.random() * 2) + 1;
        
        // Prevent duplicate items in same order
        if (!orderItems.find(item => item.product.toString() === randomMenu._id.toString())) {
            orderItems.push({
            name: randomMenu.name,
            qty: qty,
            price: randomMenu.price,
            product: randomMenu._id
            });
            totalPrice += randomMenu.price * qty;
        }
      }

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      mockOrders.push({
        user: customer._id,
        orderItems,
        contactInfo: {
          name: customer.name,
          phone: "09123456789",
          email: customer.email
        },
        deliveryAddress: {
          street: "123 Test St",
          barangay: "Concepcion",
          city: "Marikina City",
          province: "Metro Manila"
        },
        paymentMethod: "Credit Card",
        paymentResult: { status: "COMPLETED" },
        totalPrice: totalPrice,
        taxPrice: 0,
        isPaid: status !== 'Cancelled',
        paidAt: status !== 'Cancelled' ? orderDate : null,
        status: status,
        orderType: Math.random() > 0.5 ? 'Delivery' : 'Pick-up',
        scheduledDate: orderDate.toISOString().split('T')[0],
        scheduledTime: "12:00",
        createdAt: orderDate,
        updatedAt: orderDate
      });
    }

    await Order.insertMany(mockOrders);
    console.log('25 Mock Orders Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedOrders();

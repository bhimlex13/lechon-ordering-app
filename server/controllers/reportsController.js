const Order = require('../models/orderModel');
const Reservation = require('../models/reservationModel');

// @desc    Get sales and reservation reports
// @route   GET /api/reports/summary
// @access  Private (Admin, Superadmin)
const getReportsSummary = async (req, res) => {
  try {
    // --- 1. Get Total Sales from 'Orders' ---
    // We use MongoDB's aggregation pipeline
    const orderSales = await Order.aggregate([
      {
        // Only get orders that are NOT cancelled
        $match: {
          status: { $nin: ['Cancelled'] },
        },
      },
      {
        // Group all orders together
        $group: {
          _id: null, // Grouping all documents
          totalSales: { $sum: '$totalPrice' }, // Summing up the 'totalPrice' field
          totalOrders: { $sum: 1 }, // Counting the number of documents
        },
      },
    ]);

    // --- 2. Get Total from 'Reservations' (for Lechon) ---
    // We'll assume a fixed price for lechon for this report.
    // A better way would be to store the price in the reservationModel.
    // For now, let's just count them.
    const lechonReservations = await Reservation.aggregate([
      {
        $match: {
          reservationType: 'Lechon',
          status: { $nin: ['Cancelled'] },
        },
      },
      {
        $group: {
          _id: '$lechonSize', // Group by lechon size
          count: { $sum: 1 },
        },
      },
      // Example: { _id: 'Small', count: 5 }
    ]);
    
    // --- 3. Get Recent Orders ---
    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 }) // Get the newest orders first
      .limit(10); // Limit to the last 10

    // --- 4. Format and Send Response ---
    res.json({
      // From orderSales aggregation
      totalSales: orderSales.length > 0 ? orderSales[0].totalSales : 0,
      totalOrders: orderSales.length > 0 ? orderSales[0].totalOrders : 0,
      
      // From lechonReservations aggregation
      lechonSummary: lechonReservations,
      
      // From recentOrders query
      recentOrders: recentOrders,
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getReportsSummary,
};
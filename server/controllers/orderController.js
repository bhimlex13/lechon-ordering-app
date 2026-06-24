const Order = require('../models/orderModel');
const User = require('../models/userModel');
const axios = require('axios');
const sendEmail = require('../utils/sendEmail');
const branding = require('../config/branding');

// --- HELPER: BRANDED EMAIL TEMPLATE ---
const createOrderEmailTemplate = (order) => {
  const subtotal = order.totalPrice - order.taxPrice - order.deliveryFee;
  
  // For Email Images: Always prefer the Live URL so images render in Gmail/Outlook
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'; 
  const baseUrl = clientUrl.replace(/\/$/, '');

  // --- FIX: Use a Public URL for testing until you deploy 'lechon2.png' ---
const bannerImage = `${baseUrl}/images/lechon2.png`;

  // Generate Items HTML Rows
  const itemsHtml = order.orderItems.map(item => `
    <tr>
      <td style="padding: 12px 0; color: #333; width: 15%; vertical-align: top; border-bottom: 1px solid #f0f0f0;">${item.qty}x</td>
      <td style="padding: 12px 0; color: #333; width: 60%; vertical-align: top; border-bottom: 1px solid #f0f0f0;">${item.name}</td>
      <td style="padding: 12px 0; text-align: right; color: #333; width: 25%; vertical-align: top; border-bottom: 1px solid #f0f0f0;">₱${(item.price * item.qty).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #ffffff; color: #333; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      
      <div style="width: 100%; height: 180px; background-color: #eee;">
         <img src="${bannerImage}" alt="${branding.name}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
      </div>

      <div style="background-color: ${branding.colors.primary}; padding: 0 20px 30px 20px; text-align: center; position: relative;"> 
        
        <div style="width: 80px; height: 80px; margin: -40px auto 15px; background-color: white; border-radius: 50%; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            <img src="${baseUrl}/logo.png" alt="Logo" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />
        </div>

        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">Thanks for your order!</h1>
        <p style="color: ${branding.colors.primaryLight}; margin: 5px 0 0; font-size: 14px;">Order ID: ${order._id}</p>
      </div>

      <div style="padding: 25px 20px; text-align: center; border-bottom: 1px solid #f0f0f0;">
        <p style="margin: 0; color: #666; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Total Paid</p>
        <h2 style="margin: 5px 0 0; font-size: 32px; font-weight: bold; color: ${branding.colors.primary};">₱${order.totalPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}</h2>
        <div style="margin-top: 10px;">
            <span style="background-color: ${branding.colors.primaryLight}; color: ${branding.colors.primary}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                ${order.isPaid ? 'PAID' : 'PAYMENT PENDING'}
            </span>
        </div>
      </div>

      <div style="padding: 25px 20px;">
        <p style="margin: 0 0 10px; font-weight: bold; font-size: 16px; color: ${branding.colors.secondary};">Order Details</p>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${itemsHtml}
        </table>

        <div style="margin-top: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #555;">
            <tr>
                <td style="padding: 5px 0;">Subtotal</td>
                <td style="text-align: right;">₱${subtotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            </tr>
            <tr>
                <td style="padding: 5px 0;">Delivery Fee</td>
                <td style="text-align: right;">₱${order.deliveryFee.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            </tr>
            <tr>
                <td style="padding: 5px 0;">Tax</td>
                <td style="text-align: right;">₱${order.taxPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            </tr>
            <tr>
                <td style="padding: 15px 0 5px; font-weight: bold; color: ${branding.colors.secondary}; font-size: 16px; border-top: 1px dashed #ddd;">Grand Total</td>
                <td style="padding: 15px 0 5px; text-align: right; font-weight: bold; color: ${branding.colors.primary}; font-size: 16px; border-top: 1px dashed #ddd;">₱${order.totalPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            </tr>
            </table>
        </div>
        
        <div style="margin-top: 25px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; display: flex; justify-content: space-between; font-size: 12px; color: #666;">
             <div style="width: 48%;">
                <p style="margin: 0 0 4px; font-weight: bold; color: #333;">Payment Method</p>
                <p style="margin: 0;">${order.paymentMethod}</p>
             </div>
             <div style="width: 48%; text-align: right;">
                <p style="margin: 0 0 4px; font-weight: bold; color: #333;">Date</p>
                <p style="margin: 0;">${new Date(order.createdAt).toLocaleDateString()}</p>
             </div>
        </div>
        
        ${order.orderType === 'Delivery' ? `
        <div style="margin-top: 10px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; font-size: 12px; color: #666;">
            <p style="margin: 0 0 4px; font-weight: bold; color: #333;">Delivery Address</p>
            <p style="margin: 0;">${order.deliveryAddress.street}, ${order.deliveryAddress.barangay}, ${order.deliveryAddress.city}</p>
        </div>` : ''}

      </div>

      <div style="background-color: ${branding.colors.secondary}; padding: 25px 20px; text-align: center; color: #999; font-size: 12px;">
         <p style="margin: 0 0 15px; color: #fff;">Need help with your order?</p>
         
         <a href="${baseUrl}/#contact" style="display: inline-block; background-color: ${branding.colors.primary}; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 13px;">Contact Support</a>

         <div style="margin-top: 25px; border-top: 1px solid #333; padding-top: 15px;">
            <p style="margin: 0; font-weight: bold; color: #fff; font-size: 14px;">${branding.name}</p>
            <p style="margin: 5px 0 0; opacity: 0.7;">${branding.tagline}</p>
            <p style="margin-top: 15px; opacity: 0.5;">&copy; ${new Date().getFullYear()} ${branding.name}. All rights reserved.</p>
         </div>
      </div>
    </div>
  `;
};

// --- HELPER: MOCK CHECKOUT SESSION (PORTFOLIO) ---
const createMockCheckoutSession = async (order) => {
  const REDIRECT_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : (process.env.CLIENT_URL || 'http://localhost:3000');

  // Generate a mock session ID and direct to local Mock Payment Page
  const sessionId = 'mock_session_' + Date.now();
  const checkoutUrl = `${REDIRECT_URL}/mock-payment/${order._id}?amount=${order.totalPrice}`;

  return { checkoutUrl, sessionId };
};

// @desc    Create a new order
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      orderType,
      totalPrice,
      contactInfo,
      deliveryAddress,
      scheduledDate,
      scheduledTime,
      notes,
      paymentMethod,
      deliveryFee,
      taxPrice 
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      orderType,
      totalPrice,
      contactInfo,
      deliveryAddress,
      scheduledDate,
      scheduledTime,
      notes,
      paymentMethod,
      deliveryFee: deliveryFee || 0,
      taxPrice: taxPrice || 0,
      status: 'Pending'
    });

    // --- MOCK PAYMENT PRE-CHECK ---
    if (paymentMethod === 'GCash' || paymentMethod === 'Maya') {
        try {
            const { checkoutUrl, sessionId } = await createMockCheckoutSession(order);
            order.paymentSessionId = sessionId; 
            
            const createdOrder = await order.save();
            await User.findByIdAndUpdate(req.user._id, { cartItems: [] });

            try {
                await sendEmail({
                    to: contactInfo.email,
                    subject: `Order Received #${createdOrder._id} - Pending Payment`,
                    html: createOrderEmailTemplate(createdOrder)
                });
            } catch (err) { console.error("Email Error:", err); }

            return res.status(201).json({ ...createdOrder.toObject(), checkoutUrl });
        } catch (paymentError) {
            console.error("Payment Setup Failed:", paymentError);
            return res.status(500).json({ message: "Could not setup online payment. Please try again or choose Bank Transfer." });
        }
    }

    // --- STANDARD ORDER (Bank Transfer / Cash) ---
    const createdOrder = await order.save();
    await User.findByIdAndUpdate(req.user._id, { cartItems: [] });

    try {
        await sendEmail({
            to: contactInfo.email,
            subject: `Order Confirmation #${createdOrder._id} - ${branding.shortName}`,
            html: createOrderEmailTemplate(createdOrder)
        });
    } catch (err) { console.error("Email Error:", err); }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify Payment Status (MOCKED FOR PORTFOLIO)
const verifyPayment = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.isPaid) return res.json({ message: 'Already paid', order });
        if (!order.paymentSessionId) return res.status(400).json({ message: 'No payment session found' });

        // MOCK: Automatically simulate successful payment verification
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: 'mock_' + order.paymentSessionId,
            status: 'paid',
            update_time: String(Date.now()),
            email_address: order.contactInfo.email
        };
        
        const updatedOrder = await order.save();
        
        try {
            await sendEmail({
                to: order.contactInfo.email,
                subject: `Payment Received - Order #${updatedOrder._id}`,
                html: createOrderEmailTemplate(updatedOrder)
            });
        } catch (e) { console.error("Email Error:", e); }

        return res.json({ message: 'Payment verified', order: updatedOrder });
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ message: 'Payment verification failed' });
    }
};

// @desc    Get orders for the logged-in user
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'orderItems.product',
        select: 'imageUrl name' 
      });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get an order by its ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (
      req.user.role === 'Admin' ||
      req.user.role === 'Superadmin' ||
      order.user._id.equals(req.user._id)
    ) {
      res.json(order);
    } else {
      res.status(403).json({ message: 'Not authorized' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel order (User initiated)
const cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.user.equals(req.user._id)) return res.status(403).json({ message: 'Not authorized' });

    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      return res.status(400).json({ message: `Cannot cancel order that is ${order.status}` });
    }

    const scheduledDate = new Date(`${order.scheduledDate}T${order.scheduledTime}`);
    const now = new Date();
    const diffHours = (scheduledDate - now) / 36e5;

    if (diffHours < 48) {
        return res.status(400).json({ message: "Cancellation allowed only 48 hours before schedule." });
    }

    order.status = 'Cancelled';
    const updatedOrder = await order.save({ validateBeforeSave: false });
    res.json(updatedOrder);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Manually mark order as Paid (Admin)
const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.isPaid = true;
        order.paidAt = Date.now();
        const updatedOrder = await order.save({ validateBeforeSave: false });
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// @desc    Get all orders (With Filters)
const getAllOrders = async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (date) query.scheduledDate = date;

    const orders = await Order.find(query)
      .populate('user', 'id name')
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    const { status } = req.body;

    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    const updatedOrder = await order.save({ validateBeforeSave: false });
    
    if (status === 'Delivered' || status === 'Ready') {
         try {
            await sendEmail({
                to: order.contactInfo.email,
                subject: `Order Update: Your order is ${status}!`,
                html: createOrderEmailTemplate(updatedOrder)
            });
        } catch (e) { console.error("Email Error:", e); }
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  getAllOrders,
  updateOrderStatus,
  updateOrderToPaid 
};

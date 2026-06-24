const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'MenuItem', 
        },
      },
    ],
    contactInfo: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true },
    },
    deliveryAddress: {
      street: { type: String },
      barangay: { type: String },
      city: { type: String },
      province: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    deliveryFee: { type: Number, default: 0 },
    
    // --- NEW FIELD ---
    taxPrice: { type: Number, required: true, default: 0.0 },

    paymentMethod: { type: String, required: true },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    paymentSessionId: { type: String },

    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    status: {
       type: String,
       enum: ['Pending', 'Processing', 'Ready', 'Delivered', 'Cancelled'],
       default: 'Pending'
    },
    orderType: {
        type: String,
        enum: ['Pick-up', 'Delivery'],
        required: true
    },
    scheduledDate: { type: String, required: true }, 
    scheduledTime: { type: String, required: true },
    notes: { type: String }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
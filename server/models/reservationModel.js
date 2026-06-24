const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema(
  {
    // Link to the user who made the reservation
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    reservationType: {
      type: String,
      required: true,
      enum: ['Dine-in', 'Lechon'], // To distinguish between table booking and lechon
    },
    reservationDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending',
    },
    branch: {
      type: String,
      required: true,
    },
    // --- Fields specific to reservation type ---
    numberOfGuests: {
      type: Number, // Required if reservationType is 'Dine-in'
      required: function () {
        return this.reservationType === 'Dine-in';
      },
      min: 1,
    },
    lechonSize: {
      type: String, // Required if reservationType is 'Lechon'
      required: function () {
        return this.reservationType === 'Lechon';
      },
      enum: ['Small', 'Medium', 'Large'], // Based on [cite: 59-60]
    },
    isDownPaymentPaid: {
      type: Boolean, // For Lechon reservations [cite: 501]
      default: false,
    },
    notes: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
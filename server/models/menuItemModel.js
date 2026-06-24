const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: false, 
    },
    availability: {
      type: Boolean,
      required: true,
      default: true, 
    },
    // --- ITEM #18: 24-HOUR CHECKBOX ---
    requires24Hours: {
      type: Boolean,
      required: false,
      default: false
    },
    // --- LECHON DETAILS ---
    goodFor: {
      type: String, 
      required: false,
      default: ""
    },
    cookedWeight: {
      type: String,
      required: false,
      default: ""
    }
  },
  {
    timestamps: true,
  }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
module.exports = MenuItem;
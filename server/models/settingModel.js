const mongoose = require('mongoose');

const settingSchema = mongoose.Schema({
  // --- 1. GENERAL SETTINGS ---
  general: {
    taxRate: { type: Number, default: 12 }, // Percentage
    storeCoordinates: {
      lat: { type: Number, default: 14.629 },
      lng: { type: Number, default: 121.139 }
    },
    storeAddress: { type: String, default: "Default Store Location" },
    operatingHours: {
      openTime: { type: String, default: "08:00" }, // 24h format HH:mm
      closeTime: { type: String, default: "20:00" }
    },
    announcement: {
      message: { type: String, default: "" },
      enabled: { type: Boolean, default: false },
      showOnPages: [{ type: String }] // e.g. ['home', 'menu']
    }
  },

  // --- 2. LECHON SETTINGS ---
  lechon: {
    deliveryBaseFee: { type: Number, default: 100 }, // Usually higher for Lechon
    deliveryPricePerKm: { type: Number, default: 15 },
    termsAndConditions: { type: String, default: "Lechon orders require 24h lead time. 50% Downpayment required." },
    enabled: { type: Boolean, default: true }
  },

  // --- 3. FOOD SETTINGS (Standard Menu) ---
  food: {
    deliveryBaseFee: { type: Number, default: 50 },
    deliveryPricePerKm: { type: Number, default: 10 },
    freeDeliveryThreshold: { type: Number, default: 5000 },
    termsAndConditions: { type: String, default: "Standard food delivery terms." },
    enabled: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
});

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
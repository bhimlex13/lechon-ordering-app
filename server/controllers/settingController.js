const Setting = require('../models/settingModel');

// @desc    Get system settings
// @route   GET /api/settings
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    
    // Create defaults if not exists
    if (!settings) {
      settings = await Setting.create({
        general: {
            taxRate: 12,
            storeCoordinates: { lat: 14.629, lng: 121.139 },
            storeAddress: "Default Location",
            operatingHours: { openTime: "08:00", closeTime: "20:00" },
            announcement: { message: "", enabled: false, showOnPages: ['home'] }
        },
        lechon: {
            deliveryBaseFee: 100,
            deliveryPricePerKm: 20,
            termsAndConditions: "Lechon orders require at least 24 hours lead time."
        },
        food: {
            deliveryBaseFee: 50,
            deliveryPricePerKm: 10,
            freeDeliveryThreshold: 3000,
            termsAndConditions: "Standard delivery terms apply."
        }
      });
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    const { general, lechon, food } = req.body;
    
    let settings = await Setting.findOne();
    
    if (settings) {
      // Update sections if provided in body
      if (general) settings.general = { ...settings.general, ...general };
      if (lechon) settings.lechon = { ...settings.lechon, ...lechon };
      if (food) settings.food = { ...settings.food, ...food };

      const updatedSettings = await settings.save();
      res.json(updatedSettings);
    } else {
      res.status(404).json({ message: 'Settings not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
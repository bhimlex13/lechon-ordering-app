const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');

// 1. GET Settings: Public (Allows checkout page to read fees/location)
router.get('/', getSettings);

// 2. UPDATE Settings: Protected (Only Admins can change configuration)
router.put('/', protect, admin, updateSettings);

module.exports = router;
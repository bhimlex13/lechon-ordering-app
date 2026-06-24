const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// --- SAFETY CHECK (Debugging) ---
// This checks if any required function is missing and prints a warning
const requiredFunctions = [
    { name: 'getUserCart', func: userController.getUserCart },
    { name: 'getUsers', func: userController.getUsers },
    { name: 'updateUser', func: userController.updateUser },
    { name: 'protect', func: authMiddleware.protect },
    { name: 'admin', func: authMiddleware.admin }
];

requiredFunctions.forEach((item) => {
    if (!item.func) {
        console.error(`CRITICAL ERROR: '${item.name}' is undefined! Check your controller/middleware exports.`);
    }
});
// --------------------------------

// Destructure after checking
const {
  getMe,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  validateResetToken,
  initiateEmailChange,
  verifyEmailChange,
  getUserCart,
  updateUserCart,
  getUsers,
  deleteUser,
  updateUser
} = userController;

const { protect, admin } = authMiddleware;

// --- PUBLIC ROUTES ---
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/reset-password/:resetToken', validateResetToken);

// --- PRIVATE ROUTES ---
router.route('/profile')
    .get(protect, getMe)
    .put(protect, updateUserProfile);

router.post('/change-email/initiate', protect, initiateEmailChange);
router.post('/change-email/verify', protect, verifyEmailChange);

router.route('/cart')
    .get(protect, getUserCart)
    .put(protect, updateUserCart);

// --- ADMIN ROUTES ---
// If 'admin' middleware was missing, this line caused the crash
router.get('/', protect, admin, getUsers);

router.route('/:id')
    .delete(protect, admin, deleteUser)
    .put(protect, admin, updateUser);

module.exports = router;
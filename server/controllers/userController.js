const User = require('../models/userModel');
const crypto = require('crypto');
const bcrypt = require('bcryptjs'); 
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const branding = require('../config/branding');

// Helper to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Get current user data
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
  });
};

// @desc    Update User Profile
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    
    if (req.body.address) {
        user.address = {
            street: req.body.address.street || user.address?.street,
            barangay: req.body.address.barangay || user.address?.barangay,
            city: req.body.address.city || user.address?.city,
            province: req.body.address.province || user.address?.province,
        };
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      address: updatedUser.address,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Forgot Password (Send Email)
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ success: true, data: 'If that email exists, a reset link has been sent.' });
    }

    // Generate Token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

    await user.save({ validateBeforeSave: false });

    // Force Localhost in Development
    const clientUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : (process.env.CLIENT_URL || 'http://localhost:3000');
      
    const cleanClientUrl = clientUrl.replace(/\/$/, ''); 
    const resetUrl = `${cleanClientUrl}/reset-password/${resetToken}`;
    
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: ${branding.colors.primary}; text-align: center;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #333;">You recently requested to reset your password for <strong>${branding.name}</strong>.</p>
        <p style="font-size: 16px; color: #333;">Click the button below to proceed:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: ${branding.colors.primary}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
        </div>

        <p style="font-size: 14px; color: #555;">Or copy and paste this link into your browser:</p>
        <p style="font-size: 14px; color: #0066cc; word-break: break-all;">${resetUrl}</p>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">This link expires in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: `Reset Your Password - ${branding.name}`,
        html: message,
      });
      res.status(200).json({ success: true, data: 'Email Sent' });
    } catch (emailError) {
      console.error("SendEmail Error:", emailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent.' });
    }
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Validate Reset Token (GET) - NEW!
const validateResetToken = async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    res.status(200).json({ success: true });
};

// @desc    Reset Password
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    
    // --- THIS LOGIC ENSURES ONE-TIME USE ---
    user.resetPasswordToken = undefined; // Clears the token
    user.resetPasswordExpire = undefined;
    // ---------------------------------------
    
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    res.status(200).json({ success: true, data: 'Password Updated Successfully' });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- EMAIL CHANGE LOGIC ---
const initiateEmailChange = async (req, res) => {
    const { currentPassword, newEmail } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(401).json({ message: 'Incorrect password' });
    }

    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.tempEmail = newEmail;
    user.emailOtp = hashedOtp;
    user.emailOtpExpires = Date.now() + 10 * 60 * 1000; 
    await user.save();

    try {
        await sendEmail({
            to: newEmail,
            subject: 'Verify your new email',
            html: `<h3>Verification Code</h3><p>Your OTP code is: <strong>${otp}</strong></p>`
        });
        res.status(200).json({ message: 'OTP sent to new email' });
    } catch (error) {
        user.tempEmail = undefined;
        user.emailOtp = undefined;
        user.emailOtpExpires = undefined;
        await user.save();
        res.status(500).json({ message: 'Email failed to send' });
    }
};

const verifyEmailChange = async (req, res) => {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.tempEmail || !user.emailOtp) {
        return res.status(400).json({ message: 'No pending change' });
    }

    if (Date.now() > user.emailOtpExpires) {
        return res.status(400).json({ message: 'OTP expired' });
    }

    const isMatch = await bcrypt.compare(otp, user.emailOtp);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.email = user.tempEmail;
    user.tempEmail = undefined;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        token: generateToken(updatedUser._id),
        message: 'Email updated successfully'
    });
};

// --- CART FUNCTIONS ---
const getUserCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const formattedCart = user.cartItems.map(item => ({
        _id: item.product, 
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        qty: item.qty
    }));
    res.json(formattedCart);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching cart' });
  }
};

const updateUserCart = async (req, res) => {
  try {
    const { cartItems } = req.body; 
    const newCart = cartItems.map(item => ({
        product: item._id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        qty: item.qty
    }));
    await User.findByIdAndUpdate(req.user.id, { cartItems: newCart });
    res.json(cartItems); 
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating cart' });
  }
};

// --- ADMIN FUNCTIONS ---
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne(); 
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.role = req.body.role || user.role;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMe,
  updateUserProfile,
  forgotPassword,      
  resetPassword,
  validateResetToken,  // <--- ADDED EXPORT
  initiateEmailChange,
  verifyEmailChange,
  getUserCart,        
  updateUserCart,     
  getUsers,
  deleteUser,
  updateUser
};

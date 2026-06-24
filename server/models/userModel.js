const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  street: { type: String },
  barangay: { type: String },
  city: { type: String },
  province: { type: String },
});

// Sub-schema for Cart Items
const cartItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MenuItem', 
    required: true 
  },
  name: { type: String, required: true },
  imageUrl: { type: String },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, default: 1 }
}, { _id: false }); 

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: false },
    
    // --- ROLES CONFIGURATION ---
    role: { 
      type: String, 
      enum: ['User', 'Customer', 'Staff', 'Admin', 'Superadmin'], 
      default: 'Customer' 
    },
    
    address: addressSchema,

    // --- PERSISTENT CART ---
    cartItems: [cartItemSchema],

    // --- LOGIN ATTEMPTS & LOCKOUT ---
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    
    // --- EMAIL CHANGE FIELDS ---
    tempEmail: { type: String }, 
    emailOtp: { type: String },
    emailOtpExpires: { type: Date },

    // --- FORGOT PASSWORD FIELDS ---
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// --- FIX: ADD THIS METHOD ---
// This allows authController to compare the entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Password Hashing Middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
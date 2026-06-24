const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  // sign a new token
  return jwt.sign(
    { id, role }, // Payload: contains user ID and role
    process.env.JWT_SECRET, // Your secret key from .env
    {
      expiresIn: '30d', // Token expires in 30 days
    }
  );
};

module.exports = generateToken;
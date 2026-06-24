const mongoose = require('mongoose');

// This is an async function because connecting to a DB returns a promise
const connectDB = async () => {
  try {
    // Attempt to connect to the database using the URI from .env
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // If successful, log the host it connected to
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If it fails, log the error and exit the server process
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit with a non-zero status code to indicate failure
  }
};

module.exports = connectDB;
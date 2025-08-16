
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db'); // Import DB connection
const userRoutes = require('./routes/userRoutes'); // Import user routes

connectDB(); // Connect to database

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('combined'));

// Body parser middleware (for handling JSON requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes); // Use user routes

// Error handling middleware (should be after routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, cleanup, or exit
  // For production, you might want to gracefully shut down the server
  // process.exit(1); // Exit with a 'failure' code
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Application specific logging, cleanup, or exit
  // For production, you might want to gracefully shut down the server
  // process.exit(1); // Exit with a 'failure' code
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



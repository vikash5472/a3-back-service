
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db'); // Import DB connection
const authRoutes = require('./modules/auth/authRoutes'); // Import auth routes
const healthRoutes = require('./modules/health/healthRoutes'); // Import health routes
const profileRoutes = require('./modules/profile/profileRoutes'); // Import profile routes

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./docs/swagger/swagger.yaml');

const errorHandler = require('./middlewares/errorMiddleware'); // Import error handler

connectDB(); // Connect to database

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('dev'));

// Body parser middleware (for handling JSON requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Swagger UI
app.use('/api/auth', authRoutes); // Use auth routes
app.use('/api/profile', profileRoutes); // Use profile routes
app.use('/api', healthRoutes); // Use health routes

// Error handling middleware (should be after routes)
app.use(errorHandler);

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



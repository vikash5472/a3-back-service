
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const connectDB = require('./config/db'); // Import DB connection
const authRoutes = require('./modules/auth/authRoutes'); // Import auth routes
const healthRoutes = require('./modules/health/healthRoutes'); // Import health routes
const profileRoutes = require('./modules/profile/profileRoutes'); // Import profile routes
const { creditRoutes, paymentRoutes, razorpayWebhook } = require('./modules/credits/creditRoutes'); // Import credit routes

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./docs/swagger/swagger.yaml');

const errorHandler = require('./middlewares/errorMiddleware'); // Import error handler

connectDB(); // Connect to database

const app = express();
const port = process.env.PORT || 3000;

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: 'Too many requests from this IP, please try again after an hour',
});

const webhookLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 500, // Limit each IP to 500 requests per window
  message: 'Too many webhook requests from this IP, please try again after an hour',
});

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('dev'));

// Raw body parser for Razorpay webhook
app.post('/api/credits/razorpay/webhook', webhookLimiter, express.raw({ type: 'application/json' }), (req, res, next) => {
    req.rawBody = req.body.toString();
    next();
}, razorpayWebhook);

// Body parser middleware (for handling JSON requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiters
app.use('/api/auth', authLimiter);
app.use('/api/credits/intent', apiLimiter);

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Swagger UI
app.use('/api/auth', authRoutes); // Use auth routes
app.use('/api/profile', profileRoutes); // Use profile routes
app.use('/api/credits', creditRoutes); // Use credit routes
app.use('/api/payments', paymentRoutes); // Use payment routes
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



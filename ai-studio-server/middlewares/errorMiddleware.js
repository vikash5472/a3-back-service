const { AppError } = require('../utils/errorHandler');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new AppError(message.join(', '), 400);
  }

  // Joi validation error (from express-joi-validation)
  if (err.error && err.error.isJoi) {
    const message = err.error.details.map(detail => detail.message).join(', ');
    error = new AppError(message, 400);
  }

  // Custom AppError
  if (err instanceof AppError) {
    error.statusCode = err.statusCode;
    error.status = err.status;
  }

  res.status(error.statusCode || 500).json({
    status: error.status || 'error',
    message: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
};

module.exports = errorHandler;

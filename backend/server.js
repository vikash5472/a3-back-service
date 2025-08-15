require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const app = express();
const PORT = process.env.PORT || 3000;

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

app.use(express.json());

// Passport configuration
require('./config/passport')(app);

// Routes
const authRoutes = require('./routes/auth.routes');

const videoRequestsRoutes = require('./routes/video-requests.routes');

app.use('/auth', authRoutes);
app.use('/video-requests', videoRequestsRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Express.js!');
});

// Basic Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

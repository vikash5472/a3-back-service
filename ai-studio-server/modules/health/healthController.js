const asyncHandler = require('express-async-handler');

// @desc    Get API health status
// @route   GET /api/health
// @access  Public
const getHealth = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  getHealth,
};

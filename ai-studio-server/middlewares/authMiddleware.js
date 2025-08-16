const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const userRepo = require('./../modules/database/repos/userRepo'); // Adjust path as needed

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      const user = await userRepo.findById(decoded._id);

      if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      // Check if token version matches user's token version
      if (user.tokenVersion !== decoded.tokenVersion) {
        res.status(401);
        throw new Error('Not authorized, token invalidated');
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      if (error.name === 'TokenExpiredError') {
        res.status(401);
        throw new Error('Not authorized, token expired');
      } else if (error.name === 'JsonWebTokenError') {
        res.status(401);
        throw new Error('Not authorized, invalid token');
      } else {
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect };

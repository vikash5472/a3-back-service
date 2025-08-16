const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
} = require('./authController');
const { protect } = require('./../../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);

module.exports = router;

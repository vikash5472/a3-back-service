const asyncHandler = require('express-async-handler');
const authService = require('./authService');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, loginType } = req.body;

  if (!name || !email || (loginType === 'email' && !password)) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const user = await authService.registerUser({ name, email, password, loginType });

  res.status(201).json(user);
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please enter all fields');
  }

  const { _id, name, token } = await authService.loginUser(email, password);

  res.status(200).json({
    _id,
    name,
    email,
    token,
  });
});

module.exports = {
  registerUser,
  loginUser,
};

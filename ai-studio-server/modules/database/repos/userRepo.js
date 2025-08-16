const User = require('./../models/User');

// @desc    Create a new user
// @route   POST /api/users
// @access  Public
const createUser = async (userData) => {
  const user = await User.create(userData);
  return user;
};

// @desc    Find user by email
const findByEmail = async (email) => {
  const user = await User.findOne({ email }).select('+password'); // Select password for login check
  return user;
};

// @desc    Find user by ID
const findById = async (id) => {
  const user = await User.findById(id);
  return user;
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getUsers = async () => {
  const users = await User.find();
  return users;
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (id) => {
  const user = await User.findById(id);
  return user;
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Public
const updateUser = async (id, userData) => {
  const user = await User.findByIdAndUpdate(id, userData, {
    new: true,
    runValidators: true,
  });
  return user;
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Public
const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  return user;
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};

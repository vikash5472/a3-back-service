const asyncHandler = require('express-async-handler');
const profileService = require('./profileService');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.fetchProfile(req.user._id);
  res.status(200).json(profile);
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { currentPassword, ...updateData } = req.body;
  const updatedProfile = await profileService.updateProfile(req.user._id, updateData, currentPassword);
  res.status(200).json(updatedProfile);
});

module.exports = {
  getProfile,
  updateProfile,
};

const userRepo = require('../../modules/database/repos/userRepo');

const fetchProfile = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  // Return basic user info, exclude sensitive data like password hash
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    loginType: user.loginType,
    lastLogin: user.lastLogin,
    credits: user.credits,
  };
};

const updateProfile = async (userId, updateData, currentPassword) => {
  const user = await userRepo.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password for any modification
  if (!currentPassword) {
    throw new Error('Current password is required for any profile modification');
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new Error('Invalid current password');
  }

  // Update fields if provided
  if (updateData.name) {
    user.name = updateData.name;
  }
  if (updateData.email) {
    // Check if new email already exists for another user
    if (updateData.email !== user.email) {
      const existingUser = await userRepo.findByEmail(updateData.email);
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }
    user.email = updateData.email;
  }
  if (updateData.password) {
    user.password = updateData.password; // Mongoose pre-save hook will hash this
    user.incrementTokenVersion(); // Invalidate old tokens on password change
  }

  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    loginType: user.loginType,
    lastLogin: user.lastLogin,
    credits: user.credits,
  };
};

module.exports = {
  fetchProfile,
  updateProfile,
};

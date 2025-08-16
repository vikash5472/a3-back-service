const userRepo = require('../database/repos/userRepo');
const { generateToken } = require('./../../utils/jwt');
const creditsService = require('../credits/creditsService');

const registerUser = async (userData) => {
  const user = await userRepo.createUser(userData);
  await creditsService.grantSignupBonus(user._id);
  // Do not return password or sensitive info
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    loginType: user.loginType,
  };
};

const loginUser = async (email, password) => {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check if user registered with email and has a password
  if (user.loginType === 'email' && user.password) {
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
  } else if (user.loginType === 'google') {
    // For Google login, password check is not applicable here.
    // This part would typically involve verifying a Google token from the client.
    // For now, we'll assume if they are trying to login with email/password but registered with Google, it's an invalid attempt.
    throw new Error('User registered with Google. Please use Google login.');
  } else {
    throw new Error('Invalid login type or missing password.');
  }

  // Update lastLogin timestamp
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id, user.tokenVersion);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token,
  };
};

module.exports = {
  registerUser,
  loginUser,
};

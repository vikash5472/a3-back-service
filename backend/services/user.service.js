const User = require('../models/user.model');

class UserService {
  async findOne(username) {
    const user = await User.findOne({ $or: [{ email: username }, { phoneNumber: username }] }).exec();
    return user || undefined;
  }

  async create(userData) {
    const newUser = new User(userData);
    return newUser.save();
  }

  async updateAppJwtToken(userId, appJwtToken) {
    return User.findByIdAndUpdate(userId, { appJwtToken: appJwtToken }, { new: true }).exec();
  }

  async updateUser(userId, update) {
    return User.findByIdAndUpdate(userId, update, { new: true }).exec();
  }

  async findByEmailVerificationToken(token) {
    return User.findOne({ emailVerificationToken: token }).exec();
  }
}

module.exports = new UserService();

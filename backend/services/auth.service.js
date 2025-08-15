const UserService = require('./user.service');
const CacheService = require('./cache.service');
const SendgridService = require('./sendgrid.service');
const QueueService = require('./queue.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class AuthService {
  constructor() {
    this.userService = UserService;
    this.cacheService = CacheService;
    this.sendgridService = SendgridService;
    this.queueService = QueueService;
  }

  async register(registerUserDto) {
    const { email, password, firstName, lastName } = registerUserDto;
    const existingUser = await this.userService.findOne(email);
    if (existingUser) {
      throw new Error('User with this email already exists'); // Use generic Error for now, will implement custom errors later
    }
    const user = await this.userService.create({
      email,
      password,
      firstName,
      lastName,
    });
    return this.login({
      userId: user._id.toString(),
      username: user.email ?? '',
    });
  }

  async login(user) {
    const payload = {
      username: user.username,
      sub: user.userId,
    };
    const access_token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    await this.userService.updateAppJwtToken(user.userId, access_token);
    this.cacheService.set(`user_${user.userId}_token`, access_token, 3600); // Cache for 1 hour

    return {
      access_token,
    };
  }

  async linkEmail(userId, email) {
    const existingUser = await this.userService.findOne(email);
    if (existingUser) {
      throw new Error('Email already linked to another account');
    }

    const verificationToken = uuidv4();
    const verificationLink = `http://localhost:3000/auth/verify-email?token=${verificationToken}`;

    await this.userService.updateUser(userId, {
      emailVerificationToken: verificationToken,
      tempEmail: email,
    });

    this.queueService.addToQueue(async () => {
      const emailSent = await this.sendgridService.sendMail(
        email,
        'Verify your email address',
        `Please click on the following link to verify your email: ${verificationLink}`,
        `<p>Please click on the following link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`,
      );

      if (!emailSent) {
        console.error('Failed to send verification email asynchronously');
      }
    });

    return { message: 'Verification email sent. Please check your inbox.' };
  }

  async verifyEmail(token) {
    const user = await this.userService.findByEmailVerificationToken(token);

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    user.email = user.tempEmail;
    user.tempEmail = undefined;
    user.emailVerificationToken = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }

  // Google login will be handled by a separate Passport strategy and route
}

module.exports = new AuthService();

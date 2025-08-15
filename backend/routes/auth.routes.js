const express = require('express');
const router = express.Router();
const passport = require('passport');
const AuthService = require('../services/auth.service');
const UserService = require('../services/user.service');

// Register Route
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const result = await AuthService.register({ email, password, firstName, lastName });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Login Route
router.post('/login', passport.authenticate('local', { session: false }), async (req, res, next) => {
  try {
    const result = await AuthService.login({ userId: req.user._id.toString(), username: req.user.email });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Profile Route (Protected)
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  res.status(200).json(req.user);
});

// Link Email Route
router.post('/link-email', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await AuthService.linkEmail(req.user._id.toString(), email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Verify Email Route
router.get('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.query;
    const result = await AuthService.verifyEmail(token);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  async (req, res) => {
    try {
      let user = await UserService.findOne(req.user.email);

      if (!user) {
        user = await UserService.create({
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          picture: req.user.picture,
          googleAccessToken: req.user.accessToken,
        });
      }

      const result = await AuthService.login({
        userId: user._id.toString(),
        username: user.email,
      });
      res.redirect(`/success?token=${result.access_token}`);
    } catch (error) {
      res.status(500).json({ message: 'Google login failed', error: error.message });
    }
  },
);

module.exports = router;

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const UserService = require('../services/user.service');
const bcrypt = require('bcryptjs');

passport.use(new LocalStrategy({
  usernameField: 'email',
}, async (email, password, done) => {
  try {
    const user = await UserService.findOne(email);
    if (!user) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

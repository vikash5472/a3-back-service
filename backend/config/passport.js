const passport = require('passport');
const LocalStrategy = require('./../strategies/local.strategy');
const JwtStrategy = require('./../strategies/jwt.strategy');
require('./../strategies/google.strategy'); // Google strategy is self-contained

module.exports = (app) => {
  app.use(passport.initialize());
  passport.use('local', LocalStrategy);
  passport.use('jwt', JwtStrategy);

  // Serialize and Deserialize user (optional, for session-based auth)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const User = require('../models/user.model'); // Require here to avoid circular dependency
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

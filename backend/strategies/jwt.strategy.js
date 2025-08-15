const { Strategy, ExtractJwt } = require('passport-jwt');
const UserService = require('../services/user.service');
const CacheService = require('../services/cache.service');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true,
};

module.exports = new Strategy(jwtOptions, async (req, payload, done) => {
  try {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const cachedToken = CacheService.get(`user_${payload.sub}_token`);

    if (!cachedToken || cachedToken !== token) {
      return done(null, false, { message: 'Unauthorized: Token not found in cache or mismatch.' });
    }

    const user = await UserService.findOne(payload.username);
    if (!user || user.appJwtToken !== token) {
      return done(null, false, { message: 'Unauthorized: User not found or token mismatch.' });
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
});

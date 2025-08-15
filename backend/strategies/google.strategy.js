const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:6001/auth/google/callback',
  scope: ['email', 'profile'],
  passReqToCallback: true,
}, (request, accessToken, refreshToken, profile, done) => {
  const { name, emails, photos } = profile;
  const user = {
    email: emails[0].value,
    firstName: name.givenName,
    lastName: name.familyName,
    picture: photos[0].value,
    accessToken,
  };
  done(null, user);
}));

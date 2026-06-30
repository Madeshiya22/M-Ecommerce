const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const name = profile.displayName;
        const picture = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

        // Find user by email or googleId
        let user = await User.findOne({ $or: [{ email }, { googleId }] });

        if (user) {
          if (!user.isActive) {
            return done(new Error('Account is deactivated. Contact support.'), false);
          }
          // Link Google ID if not already linked
          if (!user.googleId) {
            user.googleId = googleId;
            user.authProvider = 'google';
            if (picture && !user.avatar) user.avatar = picture;
            await user.save();
          }
          return done(null, user);
        } else {
          // Create new user
          user = await User.create({
            name,
            email,
            googleId,
            avatar: picture,
            authProvider: 'google',
          });
          return done(null, user);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// We are using JWT, so we don't need serializeUser/deserializeUser for session handling.
module.exports = passport;

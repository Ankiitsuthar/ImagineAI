const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { sendWelcomeEmail, sendNewUserNotificationToAdmin } = require('../utils/emailService');

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Find or Create User
                let user = await User.findOne({ googleId: profile.id });
                if (user) {
                    return done(null, user);
                } else {
                    const newUser = {
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        avatar: profile.photos[0].value
                    };
                    user = await User.create(newUser);

                    // Mark as new user (transient flag, not saved to DB)
                    user.isNewUser = true;

                    // Send emails asynchronously (don't block auth flow)
                    sendWelcomeEmail(user).catch(err => console.error('Welcome email error:', err));
                    sendNewUserNotificationToAdmin(user).catch(err => console.error('Admin notification error:', err));

                    return done(null, user);
                }
            } catch (err) {
                console.error(err);
            }
        }));
};

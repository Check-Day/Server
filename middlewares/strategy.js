/** @format */
const dotenv = require("dotenv");
const constants = require("../strings");
const passport = require("passport");
const {
  setUserProfile,
  setSerializedUserProfile,
  setDeSerializedUserProfile,
} = require("../data/loggedInUserData");

dotenv.config();

var GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: constants.callbackURL,
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      // if adding user to database, add here
      setUserProfile(profile);
      done(null, profile);
    }
  )
);

passport.serializeUser((profile, done) => {
  setSerializedUserProfile(profile);
  done(null, profile);
});

passport.deserializeUser((profile, done) => {
  setDeSerializedUserProfile(profile);
  done(null, profile);
});
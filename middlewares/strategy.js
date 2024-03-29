/** @format */

const constants = require("../strings");
const passport = require("passport");
const {
  setUserProfile,
  setSerializedUserProfile,
  setDeSerializedUserProfile,
} = require("../data/loggedInUserData");
const { UserData, TaskData, ScratchPad } = require("../data/database/database");
const {
  insertUserDataAndScratchPadData,
} = require("../data/database/databaseOperations");
const { getParameter } = require("../parameter-store/parameters");

var GoogleStrategy = require("passport-google-oauth2").Strategy;

getParameter("GOOGLE_CLIENT_ID").then((googleClientId) => {
  getParameter("GOOGLE_CLIENT_SECRET").then((googleClientSecret) => {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: constants.callbackURL,
          passReqToCallback: true,
        },
        function (request, accessToken, refreshToken, profile, done) {
          // if adding user to database, add here. Check
          insertUserDataAndScratchPadData(JSON.parse(profile._raw));
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
  });
});

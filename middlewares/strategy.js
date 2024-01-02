/** @format */
const dotenv = require("dotenv");
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
const { getParameter } = require("../parameter-store/variableManager");

dotenv.config();

var GoogleStrategy = require("passport-google-oauth2").Strategy;

let googleClientIdValue, googleClientSecretValue;

async () => {
  logger.info("METHOD: Accessing Parameter Store in Encryption");
  statsdClient.increment(
    "api.calls.method.ACCESSING_PARAMETER_STORE_IN_Encryption"
  );
  try {
    googleClientIdValue = await getParameter("GOOGLE_CLIENT_ID");
    googleClientSecretValue = await getParameter("GOOGLE_CLIENT_SECRET");
  } catch (error) {
    logger.info("METHOD: Error Retrieving Parameter from Parameter Store");
    statsdClient.increment("api.calls.method.ERROR_FROM_PARAMETER_STORE");
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientIdValue,
      clientSecret: googleClientSecretValue,
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

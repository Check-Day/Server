/** @format */

const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const loginUserData = require("../data/loggedInUserData");
const constants = require("../strings");
const logger = require("../logger/logger");
const statsdClient = require("../statsd/statsd");
const { encrypt, decrypt } = require("../middlewares/encryption");
const { isLoggedIn } = require("../middlewares/checks");

dotenv.config();

router.use(express.urlencoded({ extended: true }));

router.get("/", async (req, res) => {
  logger.info("GET: User / Setup");
  statsdClient.increment("api.calls.method.USER_/_SETUP");
  if (!req.cookies.userProfile) {
    if (loginUserData.userProfile.userSet) {
      logger.info("GET: User / Data Set");
      statsdClient.increment("api.calls.method.USER_/_DATA_SET");
      let encryptedUserProfile = await encrypt(
        loginUserData.userProfile.userSet._raw
      );
      res.cookie("userProfile", encryptedUserProfile, {
        maxAge: constants.cookieExpiryDate,
        httpOnly: true,
      });
      res.redirect(constants.directToIndex);
    } else {
      logger.info("GET: User / Data not Set - Login Again - in Userset");
      statsdClient.increment(
        "api.calls.method.USER_/_DATA_NOT_SET_LOGIN_AGAIN_IN_USERSET"
      );
      req.session.destroy();
      res.cookie("userProfile", "", { expires: new Date(0), httpOnly: true });
      res.cookie("connect.sid", "", { expires: new Date(0), httpOnly: true });
      res.redirect(constants.redirectionAfterLogout);
    }
  } else {
    logger.info("GET: User / Data Set Previously");
    statsdClient.increment("api.calls.method.USER_/_DATA_SET_PREVIOUSLY");
    res.redirect(constants.directToIndex);
  }
});

router.get("/index", isLoggedIn, (req, res) => {
  // For User Profile
  logger.info("GET: Login Successful, get into index");
  statsdClient.increment("api.calls.method.LOGIN_SUCCESSFUL_GET_INTO_INDEX");
  res
    .status(200)
    .json({
      message: constants.loginSuccessMessage,
    })
    .end();
});

module.exports = router;

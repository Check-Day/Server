/** @format */

const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const loginUserData = require("../data/loggedInUserData");
const constants = require("../strings");
const logger = require("../logger/logger");
const statsdClient = require("../statsd/statsd");

dotenv.config();

let isLoggedIn = (req, res, next) => {
  logger.info("METHOD: Is Logged In Check");
  statsdClient.increment("api.calls.method.CHECK_LOGIN_STATUS");

  if (req.cookies.userProfile) {
    let userData = JSON.parse(req.cookies.userProfile);
    if (userData.email_verified) {
      logger.info("METHOD: Is Logged In Check Successful");
      statsdClient.increment("api.calls.method.LOGIN_STATUS_SUCCESSFUL");
      next();
    } else {
      logger.info("METHOD: Is Logged In Email Verification Failed");
      statsdClient.increment(
        "api.calls.method.LOGIN_STATUS_FAILED_DUE_TO_EMAIL_VERIFICATION"
      );
      res.cookie("userProfile", "", { expires: new Date(0), httpOnly: true });
      res.cookie("connect.sid", "", { expires: new Date(0), httpOnly: true });
      res.redirect(constants.redirectionAfterLogout);
    }
    // req.session.userProfile
  } else {
    logger.info("METHOD: Is Logged In Check Failed");
    statsdClient.increment("api.calls.method.LOGIN_STATUS_FAILED");
    res.cookie("userProfile", "", { expires: new Date(0), httpOnly: true });
    res.cookie("connect.sid", "", { expires: new Date(0), httpOnly: true });
    res.redirect(constants.redirectionAfterLogout);
  }
};

router.get("/", (req, res) => {
  logger.info("GET: User / Setup");
  statsdClient.increment("api.calls.method.USER_/_SETUP");
  if (!req.cookies.userProfile) {
    // req.session.userProfile
    // req.session.userProfile = {
    //   userSet: loginUserData.userProfile.userSet._raw,
    // };
    if (loginUserData.userProfile.userSet) {
      logger.info("GET: User / Data Set");
      statsdClient.increment("api.calls.method.USER_/_DATA_SET");
      res.cookie("userProfile", loginUserData.userProfile.userSet._raw, {
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

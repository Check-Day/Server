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
  if (req.session.userProfile) {
    logger.info("METHOD: Is Logged In Check Successful");
    statsdClient.increment("api.calls.method.LOGIN_STATUS_SUCCESSFUL");
    next();
  } else {
    logger.info("METHOD: Is Logged In Check Failed");
    statsdClient.increment("api.calls.method.LOGIN_STATUS_FAILED");
    res.redirect(constants.redirectionAfterLogout);
  }
};

router.get("/", (req, res) => {
  logger.info("GET: User / Setup");
  statsdClient.increment("api.calls.method.USER_/_SETUP");
  if (!req.session.userProfile) {
    logger.info("GET: User / Data Set");
    statsdClient.increment("api.calls.method.USER_/_DATA_SET");
    req.session.userProfile = {
      userSet: loginUserData.userProfile.userSet._raw,
    };
    res.redirect(constants.directToIndex);
  } else {
    logger.info("GET: User / Data not Set - Login Again");
    statsdClient.increment("api.calls.method.USER_/_DATA_NOT_SET_LOGIN_AGAIN");
    req.session.destroy();
    res.redirect(constants.redirectionAfterLogout);
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

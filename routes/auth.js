/** @format */

const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const passport = require("passport");
const constants = require("../strings");
const logger = require("../logger/logger");
const statsdClient = require("../statsd/statsd");
const strategy = require("../middlewares/strategy");
const loginUserData = require("../data/loggedInUserData");

dotenv.config();

router.use(passport.initialize());
router.use(passport.session());

router.get("/check-server-status", (req, res) => {
  logger.info("GET: Check Auth Servers");
  statsdClient.increment("api.calls.get.CHECK_AUTH_SERVERS");
  res
    .status(200)
    .json({
      message: constants.authServer + " " + constants.successConnection,
    })
    .end();
});

router.get(
  "/login",
  (req, res, next) => {
    logger.info("GET: Login to " + constants.loginService);
    statsdClient.increment("api.calls.get.LOGIN_TO_" + constants.loginService);
    next();
  },
  passport.authenticate(constants.loginService, {
    scope: constants.loginRequestElements,
  })
);

router.get(
  "/login-redirect",
  (req, res, next) => {
    logger.info("GET: Login Redirected back from " + constants.loginService);
    statsdClient.increment(
      "api.calls.get.LOGIN_CALLBACK_FROM_" + constants.loginService
    );
    next();
  },
  passport.authenticate(constants.loginService, {
    successRedirect: constants.successRedirection,
    failureRedirect: constants.failureRedirection,
  })
);

router.get("/logout", (req, res, next) => {
  let isLog = true;
  constants.noLogArray.map((eachUrl) => {
    if (eachUrl == req.url) {
      isLog = false;
    }
  });
  if (isLog) {
    logger.info("GET: Logout Requested from user - " + constants.loginService);
    statsdClient.increment(
      "api.calls.get.LOGOUT_REQUEST_FROM_USER_IN_" + constants.loginService
    );
  }

  loginUserData.setUserProfile(null);
  loginUserData.setSerializedUserProfile(null);
  loginUserData.setDeSerializedUserProfile(null);
  req.logout((err) => {
    if (err) {
      res
        .status(503)
        .json({
          message: constants.logoutErrorMessage,
        })
        .end();
    }
    req.session.destroy(() => {
      res.redirect(constants.redirectionAfterLogout);
    });
  });
});

module.exports = router;

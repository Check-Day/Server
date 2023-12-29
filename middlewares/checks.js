/** @format */

const logger = require("../logger/logger");
const statsdClient = require("../statsd/statsd");
const constants = require("../strings");
const { decrypt } = require("./encryption");

let isLoggedIn = (req, res, next) => {
  logger.info("METHOD: Is Logged In Check");
  statsdClient.increment("api.calls.method.CHECK_LOGIN_STATUS");

  if (req.cookies.userProfile) {
    let userData = JSON.parse(decrypt(req.cookies.userProfile));
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
  } else {
    logger.info("METHOD: Is Logged In Check Failed");
    statsdClient.increment("api.calls.method.LOGIN_STATUS_FAILED");
    res.cookie("userProfile", "", { expires: new Date(0), httpOnly: true });
    res.cookie("connect.sid", "", { expires: new Date(0), httpOnly: true });
    res.redirect(constants.redirectionAfterLogout);
  }
};

let isRequestBody = (req, res, next) => {
  logger.info("METHOD: Request Body Check Initiated");
  statsdClient.increment("api.calls.method.REQUEST_BODY_CHECK_INITIATED");
  if (req.body) {
    next();
  } else {
    res
      .status(400)
      .json({
        message: constants.emptyRequestBody,
      })
      .end();
  }
};

let isRequestBodyForText = (req, res, next) => {
  logger.info("METHOD: Request Body Check Initiated");
  statsdClient.increment("api.calls.method.REQUEST_BODY_CHECK_INITIATED");
  if (req.body.text || req.body.text == "") {
    if (req.body.text == undefined || req.body.text == null) {
      res
        .status(400)
        .json({
          message: constants.invalidRequestBodyText,
        })
        .end();
    } else {
      next();
    }
  } else {
    res
      .status(400)
      .json({
        message: constants.emptyRequestBodyText,
      })
      .end();
  }
};

let isRequestBodyForTextWithEmptyText = (req, res, next) => {
  logger.info("METHOD: Request Body Check Initiated");
  statsdClient.increment("api.calls.method.REQUEST_BODY_CHECK_INITIATED");
  if (req.body.text || req.body.text == "") {
    if (req.body.text == undefined || req.body.text == null) {
      res
        .status(400)
        .json({
          message: constants.invalidRequestBodyText,
        })
        .end();
    } else {
      next();
    }
  } else {
    res
      .status(400)
      .json({
        message: constants.emptyRequestBodyText,
      })
      .end();
  }
};

module.exports = {
  isLoggedIn,
  isRequestBody,
  isRequestBodyForText,
  isRequestBodyForTextWithEmptyText,
};

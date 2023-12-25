/** @format */

const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const loginUserData = require("../data/loggedInUserData");
const constants = require("../strings");

dotenv.config();

let isLoggedIn = (req, res, next) => {
  if (req.session.userProfile) {
    next();
  } else {
    res.redirect(constants.redirectionAfterLogout);
  }
};

router.get("/", (req, res) => {
  if (!req.session.userProfile) {
    req.session.userProfile = {
      userSet: loginUserData.userProfile.userSet._raw,
    };
    res.redirect(constants.directToIndex);
  } else {
    req.session.destroy();
    res.redirect(constants.redirectionAfterLogout);
  }
});

router.get("/index", isLoggedIn, (req, res) => {
  res
    .status(200)
    .json({
      message: "Logged in",
    })
    .end();
});

module.exports = router;

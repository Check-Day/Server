/** @format */

const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const loginUserData = require("../data/loggedInUserData");
const constants = require("../strings");

dotenv.config();

let isLoggedIn = (req, res, next) => {
  if (loginUserData.userProfile.userSet) {
    next();
  } else {
    res
      .status(401)
      .json({
        message: "Unauthorized user. Please login.",
      })
      .end();
  }
};

router.get("/", (req, res) => {
  res.redirect(constants.directToIndex);
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

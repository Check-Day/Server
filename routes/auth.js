/** @format */

const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const passport = require("passport");
const constants = require("../strings");
const logger = require("../logger/logger");
const statsdClient = require("../statsd/statsd");

dotenv.config();

var GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://127.0.0.1:5969/auth/checkday",
      passReqToCallback: true,
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(accessToken);
      console.log(refreshToken);
      console.log(profile);
      console.log(cb);
    }
  )
);

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

router.get("/", (req, res) => {
  res.send("<a href='/auth/google/'>Authenticate with Google</a>");
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] }),
  (req, res) => {}
);

router.get(
  "/checkday",
  passport.authenticate("google", {
    successRedirect: '/protected',
    failureRedirect: '/failed'
  }),
  (req, res) => {}
);

router.get("/protected", (req, res) => {
  res.send("Hello");
});

module.exports = router;

/** @format */

const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const constants = require("../strings");
const logger = require("../logger/logger");
const statsdClient = require("../statsd/statsd");

dotenv.config();

router.get("/check-server-status", (req, res) => {
  logger.info("GET: Check Auth Servers");
  statsdClient.increment("api.calls.get.CHECK_AUTH_SERVERS");
  res.json({
    message: constants.authServer + " " + constants.successConnection,
  });
});

module.exports = router;

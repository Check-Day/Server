/** @format */

const express = require("express");
const logger = require("./logger/logger");
const statsdClient = require("./statsd/statsd");
const constants = require("./strings");

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  logger.info("GET: Check");
  statsdClient.increment("api.calls.get.CHECK");
  res.json({
    message: constants.successConnection,
  });
});

app.listen(PORT, (error) => {
  if (!error) {
    console.log(constants.successServer + PORT);
  } else console.log(constants.serverError, error);
});

module.exports = app;

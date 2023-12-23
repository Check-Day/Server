/** @format */

const express = require("express");
const logger = require("./logger/logger");
const statsdClient = require("./statsd/statsd");
const constants = require("./strings");
const authRoutes = require("./routes/auth");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const port = process.env.APPLICATION_PORT;

app.get("/check-server-status", (req, res) => {
  logger.info("GET: Check");
  statsdClient.increment("api.calls.get.CHECK_MAIN_SERVER");
  res.json({
    message: constants.mainServer + " " + constants.successConnection,
  });
});

app.use("/auth", authRoutes);

app.listen(port, (error) => {
  if (!error) {
    console.log(constants.successServer + port);
  } else console.log(constants.serverError, error);
});

module.exports = app;

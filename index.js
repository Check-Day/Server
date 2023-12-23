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

app.get("/main/check-server-status", (req, res) => {
  logger.info("GET: Check Main Server");
  statsdClient.increment("api.calls.get.CHECK_MAIN_SERVER");
  res
    .status(200)
    .json({
      message: constants.mainServer + " " + constants.successConnection,
    })
    .end();
});

app.use("/auth", authRoutes);

app.all("*", (req, res) => {
  logger.info("ALL: Unknown Method Called: " + req.url);
  statsdClient.increment("api.calls.all.UNKNOWN_METHOD_CALLED_" + req.url);
  res
    .status(405)
    .json({
      message: constants.methodNotAllowed,
    })
    .end();
});

app.listen(port, (error) => {
  if (!error) {
    console.log(constants.successServer + port);
  } else console.log(constants.serverError, error);
});

module.exports = app;

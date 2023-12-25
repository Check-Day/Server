/** @format */

const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const logger = require("./logger/logger");
const statsdClient = require("./statsd/statsd");
const constants = require("./strings");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");

dotenv.config();

const app = express();

const port = process.env.APPLICATION_PORT;

app.use(
  session({
    secret: process.env.SALT,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.IS_PRODUCTION == "true" ? true : false },
  })
);

app.use(cookieParser());

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
app.use("/user", userRoutes);

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

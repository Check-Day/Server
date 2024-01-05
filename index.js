/** @format */

const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const logger = require("./logger/logger");
const statsdClient = require("./statsd/statsd");
const constants = require("./strings");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const taskRoutes = require("./routes/task");
const mainRoutes = require("./routes/main");
const scratchPadRoutes = require("./routes/scratchpad");
const { dbSync } = require("./data/database/database");
const { getParameter } = require("./parameter-store/parameters");

const app = express();

let port, salt, isProduction;

getParameter("APPLICATION_PORT").then((applicationPort) => {
  port = applicationPort;
  getParameter("SALT").then((appSalt) => {
    salt = appSalt;
    getParameter("IS_PRODUCTION").then(async (isProd) => {
      isProduction = isProd;
      app.use(
        session({
          secret: salt,
          resave: false,
          saveUninitialized: true,
          cookie: { secure: isProduction == "true" ? true : false },
        })
      );

      app.use(cookieParser());
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());

      let sequelize = await dbSync();

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
      app.use("/scratch-pad", scratchPadRoutes);
      app.use("/task", taskRoutes);
      app.use("/main", mainRoutes);

      app.all("*", (req, res) => {
        logger.info("ALL: Unknown Method Called: " + req.url);
        statsdClient.increment(
          "api.calls.all.UNKNOWN_METHOD_CALLED_" + req.url
        );
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
    });
  });
});

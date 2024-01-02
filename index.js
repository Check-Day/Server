/** @format */

const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
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
const sequelize = require("./data/database/sequelize");
const database = require("./data/database/database");
const { getParameter } = require("./parameter-store/variableManager");

dotenv.config();

const app = express();
database.databaseSync();

let portValue, saltValue, isProductionValue;

async () => {
  logger.info("METHOD: Accessing Parameter Store in Index");
  statsdClient.increment("api.calls.method.ACCESSING_PARAMETER_STORE_IN_INDEX");
  try {
    portValue = await getParameter("APPLICATION_PORT");
    saltValue = await getParameter("SALT");
    isProductionValue = await getParameter("IS_PRODUCTION");
  } catch (error) {
    logger.info("METHOD: Error Retrieving Parameter from Parameter Store");
    statsdClient.increment("api.calls.method.ERROR_FROM_PARAMETER_STORE");
  }
};

const port = portValue;

app.use(
  session({
    secret: saltValue,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: isProductionValue == "true" ? true : false,
    },
  })
);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

sequelize
  .authenticate()
  .then(() => {
    console.log(constants.database_connection_success);
  })
  .catch((error) => {
    console.log(constants.database_connection_failure);
    throw error;
  });

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

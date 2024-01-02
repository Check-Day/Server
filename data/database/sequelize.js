/** @format */

const Sequelize = require("sequelize");
const dotenv = require("dotenv");
const { getParameter } = require("../../parameter-store/variableManager");

dotenv.config();

let databaseNameValue,
  databaseUsernameValue,
  databasePasswordValue,
  databaseHostValue,
  databaseDialectValue;

async () => {
  logger.info("METHOD: Accessing Parameter Store in Sequelize");
  statsdClient.increment(
    "api.calls.method.ACCESSING_PARAMETER_STORE_IN_SEQUELIZE"
  );
  try {
    databaseNameValue = await getParameter("DATABASE_NAME");
    databaseUsernameValue = await getParameter("DATABASE_USERNAME");
    databasePasswordValue = await getParameter("DATABASE_PASSWORD");
    databaseHostValue = await getParameter("DATABASE_HOST");
    databaseDialectValue = await getParameter("DATABASE_DIALECT");
  } catch (error) {
    logger.info("METHOD: Error Retrieving Parameter from Parameter Store");
    statsdClient.increment("api.calls.method.ERROR_FROM_PARAMETER_STORE");
  }
};

const sequelize = new Sequelize(
  databaseNameValue,
  databaseUsernameValue,
  databasePasswordValue,
  {
    host: databaseHostValue,
    dialect: databaseDialectValue,
  }
);

module.exports = sequelize;

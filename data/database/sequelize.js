/** @format */

const Sequelize = require("sequelize");
const constants = require("../../strings");

const sequelize = new Sequelize(
  constants.database_name,
  constants.database_username,
  constants.database_password,
  {
    host: constants.database_host,
    dialect: constants.database_dialect,
  }
);

module.exports = sequelize;

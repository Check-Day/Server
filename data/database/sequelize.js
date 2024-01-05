/** @format */

const Sequelize = require("sequelize");
const { getParameter } = require("../../parameter-store/parameters");

let sequelize;

const initDatabase = async () => {
  const dbName = await getParameter("DATABASE_NAME");
  const dbUsername = await getParameter("DATABASE_USERNAME");
  const dbPassword = await getParameter("DATABASE_PASSWORD");
  const dbHost = await getParameter("DATABASE_HOST");
  const dbDialect = await getParameter("DATABASE_DIALECT");
  sequelize = new Sequelize(dbName, dbUsername, dbPassword, {
    host: dbHost,
    dialect: dbDialect,
  });
  return sequelize;
};

module.exports = { initDatabase, sequelize };

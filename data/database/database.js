/** @format */

const { DataTypes } = require("sequelize");
const { initDatabase } = require("./sequelize");
const logger = require("../../logger/logger");
const statsdClient = require("../../statsd/statsd");
const constants = require("../../strings");

let UserData, TaskData, ScratchPadData, databaseSync;

const dbSync = async () => {
  sequelize = await initDatabase();
  UserData = sequelize.define("UserData", {
    serialNumber: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    sub: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isPremium: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
    },
    accountCreated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    name: {
      type: DataTypes.STRING,
    },
    profilePicture: {
      type: DataTypes.STRING,
    },
    isScratchPad: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  TaskData = sequelize.define("TaskData", {
    serial: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    sub: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: UserData,
        key: "sub",
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: UserData,
        key: "email",
      },
    },
    task: {
      type: DataTypes.TEXT,
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    taskCreated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  ScratchPadData = sequelize.define("ScratchPadData", {
    serial: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    sub: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      references: {
        model: UserData,
        key: "sub",
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      references: {
        model: UserData,
        key: "email",
      },
    },
    text: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    dateTimeUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  logger.info("DATABASE SYNC CALLED");
  statsdClient.increment("api.calls.databaseSync.databaseSyncCalled");
  sequelize.sync();
  sequelize
    .authenticate()
    .then(() => {
      console.log(constants.database_connection_success);
    })
    .catch((error) => {
      console.log(constants.database_connection_failure);
      throw error;
    });
};

module.exports = { dbSync, UserData, TaskData, ScratchPadData };

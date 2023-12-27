/** @format */

const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");
const logger = require("../../logger/logger");
const statsdClient = require("../../statsd/statsd");

const UserData = sequelize.define("UserData", {
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

const TaskData = sequelize.define("TaskData", {
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

const ScratchPad = sequelize.define("ScratchPad", {
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
  },
  dateTimeUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

logger.info("DATABASE SYNC CALLED");
statsdClient.increment("api.calls.databaseSync.databaseSyncCalled");

const databaseSync = async () => {
  await sequelize.sync();
};

module.exports = { UserData, TaskData, ScratchPad, databaseSync };

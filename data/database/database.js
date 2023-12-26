/** @format */

const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

// UserData Schema
const UserData = sequelize.define("UserData", {
  serialNumber: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  sub: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
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

// TaskData Schema
const TaskData = sequelize.define("TaskData", {
  serial: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  sub: {
    type: DataTypes.BIGINT,
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
    type: DataTypes.TEXT("long"),
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

// ScratchPad Schema
const ScratchPad = sequelize.define("ScratchPad", {
  serial: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  sub: {
    type: DataTypes.BIGINT,
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
    type: DataTypes.TEXT("long"),
  },
  dateTimeUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = { UserData, TaskData, ScratchPad };

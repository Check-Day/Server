/** @format */

const winston = require("winston");
const os = require("os");
const paths = require("../absolutePaths");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
      const hostname = os.hostname();
      const logObj = {
        hostname,
        level: info.level,
        message: info.message,
      };
      return JSON.stringify(logObj);
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: paths.logsPath,
    }),
  ],
});

module.exports = logger;

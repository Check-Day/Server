/** @format */

const stringify = require("json-stringify-safe");
const logger = require("../../logger/logger");
const { encrypt, decrypt } = require("../../middlewares/encryption");
const statsdClient = require("../../statsd/statsd");
const { UserData } = require("./database");

const insertUserData = async (userProfile) => {
  logger.info("TRYING TO INSERTING USER INTO DATABASE");
  statsdClient.increment("api.calls.dataInsertion.DataInsertionCalledToTry");
  try {
    const findUserByEmail = await UserData.findOne({
      where: { email: userProfile.email },
    });
    logger.info("USER ALREADY EXISTS");
    statsdClient.increment("api.calls.dataInsertion.userExists");
    return true;
  } catch (error) {
    try {
      const newUser = await UserData.create({
        sub: userProfile.sub,
        email: userProfile.email,
        isEmailVerified: userProfile.email_verified,
        name: userProfile.name,
        profilePicture: userProfile.picture,
      });
      logger.info("DATA INSERTED");
      statsdClient.increment("api.calls.dataInsertion.DataInserted");
      return true;
    } catch (error) {
      logger.info("DATA UNABLE TO INSERT DUE TO ERROR");
      statsdClient.increment("api.calls.dataInsertion.DataNotInserted");
      return false;
    }
  }
};

module.exports = { insertUserData };

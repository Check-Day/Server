/** @format */

const logger = require("../../logger/logger");
const { encrypt, decrypt } = require("../../middlewares/encryption");
const statsdClient = require("../../statsd/statsd");
const { UserData } = require("./database");

const insertUserData = async (userProfile) => {
  logger.info("INSERTING USER INTO DATABASE");
  statsdClient.increment("api.calls.dataInsertion.DataInsertionCalled");
  try {
    const newUser = await UserData.create({
      sub: userProfile.sub,
      email: userProfile.email,
      isEmailVerified: userProfile.email_verified,
      name: userProfile.name,
      profilePicture: userProfile.picture,
    });
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = { insertUserData };

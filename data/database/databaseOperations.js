/** @format */

const stringify = require("json-stringify-safe");
const logger = require("../../logger/logger");
const { encrypt, decrypt } = require("../../middlewares/encryption");
const statsdClient = require("../../statsd/statsd");
const { UserData, ScratchPadData } = require("./database");
const constants = require("../../strings");

const insertUserDataAndScratchPadData = async (userProfile) => {
  logger.info("TRYING TO INSERTING USER INTO DATABASE");
  statsdClient.increment("api.calls.dataInsertion.DataInsertionCalledToTry");
  try {
    const findUserByEmail = await UserData.findOne({
      where: { email: userProfile.email },
    });
    if (findUserByEmail == null) {
      throw error;
    } else {
      logger.info("USER ALREADY EXISTS");
      statsdClient.increment("api.calls.dataInsertion.userExists");
      return true;
    }
  } catch (error) {
    try {
      const newUser = await UserData.create({
        sub: userProfile.sub,
        email: userProfile.email,
        isEmailVerified: userProfile.email_verified,
        name: userProfile.name,
        profilePicture: userProfile.picture,
      });
      try {
        const newScratchPad = await ScratchPadData.create({
          sub: userProfile.sub,
          email: userProfile.email,
        });
      } catch (error) {
        logger.info("UNABLE TO CREATE SCRATCHPAD");
        statsdClient.increment(
          "api.calls.dataInsertion.UnableToCreateScratchPad"
        );
        return false;
      }
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

const getDataFromScratchPad = async (userEmail, url) => {
  try {
    let scratchPadText = await ScratchPadData.findOne({
      where: {
        email: userEmail,
      },
    });
    let textFromScratchPad = scratchPadText.dataValues.text;
    logger.info("GET: Retrieved Scratchpad Data: " + url);
    statsdClient.increment("api.calls.all.RETRIEVED_SCRATCHPAD_" + url);
    return {
      isRetrieved: true,
      status: 200,
      message: textFromScratchPad,
    };
  } catch (error) {
    logger.info("GET: Scratchpad Unable to Retrieve: " + url);
    statsdClient.increment(
      "api.calls.all.UNABLE_TO_RETRIEVE_SCRATCHPAD_" + url
    );
    return {
      isRetrieved: false,
      status: 503,
      message: constants.unableToRetrieveDataFromScratchPad,
    };
  }
};

const updateScratchPad = async (updatedText, userEmail, dateTime) => {
  logger.info("UPDATING SCRATCHPAD");
  statsdClient.increment("api.calls.scratchPadUpdate.UpdatingScratchPad");
  try {
    logger.info("UPDATING SCRATCHPAD");
    statsdClient.increment("api.calls.scratchPadUpdate.UpdatingScratchPad");
    const scratchPad = await ScratchPadData.findOne({
      where: {
        email: userEmail,
      },
    });
    if (!scratchPad) {
      logger.info("UNABLE TO FIND THE USER TO UPDATE SCRATCHPAD");
      statsdClient.increment(
        "api.calls.scratchPadUpdate.UnableToFindUserToUpdateScratchPad"
      );
      return {
        updateStatus: false,
        message: constants.unableToFindUser,
        status: 401,
      };
    } else {
      const updatedScratchPad = await scratchPad.update({
        text: updatedText,
        dateTimeUpdated: dateTime,
      });
      logger.info("UPDATED SCRATCHPAD FOR USER");
      statsdClient.increment(
        "api.calls.scratchPadUpdate.UpdatedScratchPadForUser"
      );
      return {
        updateStatus: true,
        message: constants.successScratchPadUpdate,
        status: 201,
      };
    }
  } catch (error) {
    logger.info("Error Updating ScratchPad");
    statsdClient.increment(
      "api.calls.scratchPadUpdate.Error Updating ScratchPad"
    );
    return {
      updateStatus: false,
      message: constants.errorUpdatingScratchPad,
      status: 503,
    };
  }
};

module.exports = {
  insertUserDataAndScratchPadData,
  getDataFromScratchPad,
  updateScratchPad,
};

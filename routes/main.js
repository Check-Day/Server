/** @format */

const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/checks");
const { decrypt } = require("../middlewares/encryption");
const logger = require("../logger/logger");
const statsdClient = require("../statsd/statsd");
const constants = require("../strings");
const {
  getTasksForUser,
  getDataFromScratchPad,
} = require("../data/database/databaseOperations");

router.get("/index", isLoggedIn, async (req, res) => {
  logger.info("GET: Get Tasks For User");
  statsdClient.increment("api.calls.get.GET_TASKS_FOR_USERS");
  let decryptedUserProfile = await decrypt(req.cookies.userProfile);
  let userProfile = JSON.parse(decryptedUserProfile);
  try {
    let getTasks = await getTasksForUser(userProfile.email, userProfile.sub);
    let getScratchPad = await getDataFromScratchPad(userProfile.email, req.url);
    res
      .status(getTasks.status)
      .json({
        message: getTasks.message,
        scratchPad: getScratchPad.isRetrieved
          ? getScratchPad.message
          : constants.unableToRetrieveDataFromScratchPad,
      })
      .end();
  } catch (error) {
    res
      .status(503)
      .json({
        message: constants.errorGettingTasksForUser,
      })
      .end();
  }
});

module.exports = router;

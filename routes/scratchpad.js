/** @format */

const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const {
  isLoggedIn,
  isRequestBody,
  isRequestBodyForText,
} = require("../middlewares/checks");
const { encrypt, decrypt } = require("../middlewares/encryption");
const { ScratchPadData } = require("../data/database/database");
const constants = require("../strings");
const logger = require("../logger/logger");
const statsdClient = require("../statsd/statsd");
const { updateScratchPad } = require("../data/database/databaseOperations");

dotenv.config();

router.use(express.urlencoded({ extended: true }));

router.get("/my-scratch-pad", isLoggedIn, async (req, res) => {
  let userData = JSON.parse(decrypt(req.cookies.userProfile));
  try {
    let scratchPadText = await ScratchPadData.findOne({
      where: {
        email: userData.email,
      },
    });
    let textFromScratchPad = scratchPadText.dataValues.text;
    logger.info("GET: Retrieved Scratchpad Data: " + req.url);
    statsdClient.increment("api.calls.all.RETRIEVED_SCRATCHPAD_" + req.url);
    res
      .status(200)
      .json({
        message: textFromScratchPad,
      })
      .end();
  } catch (error) {
    logger.info("GET: Scratchpad Unable to Retrieve: " + req.url);
    statsdClient.increment(
      "api.calls.all.UNABLE_TO_RETRIEVE_SCRATCHPAD_" + req.url
    );
    res
      .status(503)
      .json({
        message: constants.failedScratchPadLoad,
      })
      .end();
  }
});

router.put(
  "/update-scratch-pad",
  isLoggedIn,
  isRequestBody,
  isRequestBodyForText,
  async (req, res) => {
    let userData = JSON.parse(decrypt(req.cookies.userProfile));
    try {
      await updateScratchPad(req.body.text, userData.email, new Date());
      res.status(201).json({
        message: constants.successScratchPadUpdate,
      });
    } catch (error) {
      res.status(503).json({
        message: constants.errorUpdatingScratchPad,
      });
    }
  }
);

module.exports = router;

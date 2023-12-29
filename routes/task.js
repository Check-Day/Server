/** @format */

const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const {
  isLoggedIn,
  isRequestBody,
  isRequestBodyForTextWithEmptyText,
  isRequestBodyForSerial,
} = require("../middlewares/checks");
const { decrypt } = require("../middlewares/encryption");
const logger = require("../logger/logger");
const statsdClient = require("../statsd/statsd");
const constants = require("../strings");
const {
  addTaskForUser,
  updateTaskForUser,
  deleteTaskForUser,
} = require("../data/database/databaseOperations");

dotenv.config();

router.post(
  "/add-task",
  isLoggedIn,
  isRequestBody,
  isRequestBodyForTextWithEmptyText,
  async (req, res) => {
    logger.info("POST: Add Task For User");
    statsdClient.increment("api.calls.post.ADD_TASK_FOR_USERS");
    let userProfile = JSON.parse(decrypt(req.cookies.userProfile));
    try {
      let addTask = await addTaskForUser(
        userProfile.sub,
        userProfile.email,
        req.body.text
      );
      res
        .status(addTask.status)
        .json({
          message: addTask.message,
        })
        .end();
    } catch (error) {
      res
        .status(503)
        .json({
          message: constants.errorAddingTaskForUser,
        })
        .end();
    }
  }
);

router.put(
  "/update-task",
  isLoggedIn,
  isRequestBody,
  isRequestBodyForTextWithEmptyText,
  async (req, res) => {
    logger.info("POST: Update Task For User");
    statsdClient.increment("api.calls.post.UPDATE_TASK_FOR_USERS");
    try {
      let updateTask = await updateTaskForUser(
        parseInt(req.body.serial),
        req.body.text
      );
      res
        .status(updateTask.status)
        .json({
          message: updateTask.message,
        })
        .end();
    } catch (error) {
      res
        .status(503)
        .json({
          message: constants.errorAddingTaskForUser,
        })
        .end();
    }
  }
);

router.delete(
  "/delete-task",
  isLoggedIn,
  isRequestBody,
  isRequestBodyForSerial,
  async (req, res) => {
    logger.info("POST: Delete Task For User");
    statsdClient.increment("api.calls.post.DELETE_TASK_FOR_USERS");
    try {
      let deleteTask = await deleteTaskForUser(parseInt(req.body.serial));
      res
        .status(deleteTask.status)
        .json({
          message: deleteTask.message,
        })
        .end();
    } catch (error) {
      res
        .status(503)
        .json({
          message: constants.errorDeletingTaskForUser,
        })
        .end();
    }
  }
);

module.exports = router;

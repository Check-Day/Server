/** @format */

const stringify = require("json-stringify-safe");
const logger = require("../../logger/logger");
const { encrypt, decrypt } = require("../../middlewares/encryption");
const statsdClient = require("../../statsd/statsd");
const { UserData, ScratchPadData, TaskData } = require("./database");
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

const addTaskForUser = async (sub, email, text) => {
  logger.info("ADDING TASK FOR USER");
  statsdClient.increment("api.calls.taskOperation.AddingTaskForUser");
  try {
    logger.info("ADDING TASK");
    statsdClient.increment("api.calls.taskOperation.AddingTask");
    const addTask = await TaskData.create({
      sub: sub,
      email: email,
      task: text,
    });
    logger.info("TASK ADDED");
    statsdClient.increment("api.calls.taskOperation.TaskAdded");
    return {
      addStatus: true,
      message: {
        serial: addTask.dataValues.serial,
        task: addTask.dataValues.task,
      },
      status: 201,
    };
  } catch (error) {
    logger.info("Error Adding Task");
    statsdClient.increment("api.calls.taskOperation.ErrorAddingTask");
    return {
      addStatus: false,
      message: constants.errorAddingTask,
      status: 503,
    };
  }
};

const updateTaskForUser = async (serial, newTask) => {
  logger.info("UPDATING TASK FOR USER");
  statsdClient.increment("api.calls.taskOperation.UpdatingTaskForUser");
  try {
    logger.info("UPDATING TASK");
    statsdClient.increment("api.calls.taskOperation.UpdatingTask");
    const task = await TaskData.findOne({
      where: {
        serial: serial,
      },
    });
    if (task) {
      logger.info("TASK FOUND");
      statsdClient.increment("api.calls.taskOperation.TASK_FOUND");
      await task.update({
        task: newTask,
        updatedAt: new Date(),
      });
      logger.info("TASK UPDATED");
      statsdClient.increment("api.calls.taskOperation.TASK =_UPDATED");
      return {
        updateStatus: true,
        message: {
          serial: serial,
          task: newTask,
        },
        status: 201,
      };
    } else {
      logger.info("Unable to find Task to Update");
      statsdClient.increment(
        "api.calls.taskOperation.UNABLE_TO_FIND_TASK_TO_UPDATE"
      );
      return {
        updateStatus: false,
        message: constants.noTaskFound,
        status: 204,
      };
    }
  } catch (error) {
    logger.info("Error Updating Task");
    statsdClient.increment("api.calls.taskOperation.ErrorUpdatingTask");
    return {
      updateStatus: false,
      message: constants.errorAddingTask,
      status: 503,
    };
  }
};

const deleteTaskForUser = async (serial) => {
  logger.info("DELETING TASK FOR USER");
  statsdClient.increment("api.calls.taskOperation.DeletingTaskForUser");
  try {
    logger.info("DELETING TASK");
    statsdClient.increment("api.calls.taskOperation.DeletingTask");
    const task = await TaskData.findOne({
      where: {
        serial: serial,
      },
    });
    if (task) {
      logger.info("TASK FOUND");
      statsdClient.increment("api.calls.taskOperation.TASK_FOUND");
      await task.destroy();
      logger.info("TASK DELETED");
      statsdClient.increment("api.calls.taskOperation.TASK_DELETED");
      return {
        deleteStatus: true,
        message: serial + constants.deletingTaskForUser,
        status: 204,
      };
    } else {
      logger.info("Unable to find Task to Update");
      statsdClient.increment(
        "api.calls.taskOperation.UNABLE_TO_FIND_TASK_TO_UPDATE"
      );
      return {
        deleteStatus: false,
        message: constants.noTaskFound,
        status: 204,
      };
    }
  } catch (error) {
    logger.info("Error Deleting Task");
    statsdClient.increment("api.calls.taskOperation.ErrorDeletingTask");
    return {
      deleteStatus: false,
      message: constants.errorAddingTask,
      status: 503,
    };
  }
};

const getTasksForUser = async (email, sub) => {
  logger.info("GET ALL TASKS FOR USER");
  statsdClient.increment("api.calls.taskOperation.GET_ALL_TASKS_FOR_USER");
  try {
    logger.info("GETTING TASKS");
    statsdClient.increment("api.calls.taskOperation.GetAllTasksForUser");
    const tasks = await TaskData.findAll({
      where: {
        email: email,
        sub: sub,
      },
    });
    tasksArray = [];
    tasks.map((eachTaskData) => {
      delete eachTaskData.dataValues.sub;
      delete eachTaskData.dataValues.email;
      delete eachTaskData.dataValues.createdAt;
      eachTaskData.dataValues.sub;
      tasksArray.push(eachTaskData.dataValues);
    });
    if (tasksArray.length) {
      logger.info("TASKS FOUND");
      statsdClient.increment("api.calls.taskOperation.TASKS_FOUND");
      return {
        getStatus: true,
        message: tasksArray,
        status: 200,
      };
    } else {
      logger.info("Unable to find Task to Get");
      statsdClient.increment(
        "api.calls.taskOperation.UNABLE_TO_FIND_TASK_TO_GET"
      );
      return {
        getStatus: true,
        message: constants.noTaskFound,
        status: 201,
      };
    }
  } catch (error) {
    logger.info("Error Getting Task");
    statsdClient.increment("api.calls.taskOperation.ErrorGettingTasks");
    return {
      getStatus: false,
      message: constants.errorAddingTask,
      status: 503,
    };
  }
};

module.exports = {
  insertUserDataAndScratchPadData,
  getDataFromScratchPad,
  updateScratchPad,
  addTaskForUser,
  updateTaskForUser,
  deleteTaskForUser,
  getTasksForUser,
};

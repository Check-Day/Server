/** @format */

const express = require("express");
const logger = require("./logger/logger");
const statsdClient = require("./statsd/statsd");

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  logger.info("GET: Check");
  statsdClient.increment("api.calls.get.CHECK");
  res.json({
    message: "Received Request",
  });
});

app.listen(PORT, (error) => {
  if (!error) {
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  } else console.log("Error occurred, server can't start", error);
});

module.exports = app;

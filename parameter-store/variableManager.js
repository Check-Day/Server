/** @format */

const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const logger = require("../logger/logger");
const statsdClient = require("../statsd/statsd");
const constants = require("../strings");

let getParameter = async (parameterName) => {
  logger.info("METHOD: Into Parameter Store for Search for " + parameterName);
  statsdClient.increment(
    "api.calls.method.CHECK_PARAMETER_STORE_FOR_" + parameterName
  );
  const ssmClient = new SSMClient({
    region: constants.awsRegion,
    credentials: defaultProvider(),
  });

  const command = new GetParameterCommand({
    Name: parameterName,
    WithDecryption: true,
  });

  try {
    const response = await ssmClient.send(command);
    logger.info(
      "METHOD: Success Retrieving Values from Parameter Store for " +
        parameterName
    );
    statsdClient.increment(
      "api.calls.method.SUCCESS_FROM_PARAMETER_STORE_FOR_" + parameterName
    );
    return response.Parameter.Value;
  } catch (error) {
    logger.info(
      "METHOD: Error Retrieving Values from Parameter Store for " +
        parameterName
    );
    statsdClient.increment(
      "api.calls.method.ERROR_FROM_PARAMETER_STORE_FOR_" + parameterName
    );
    console.error("Error getting parameter: ", error);
    throw error;
  }
};

module.exports = { getParameter };

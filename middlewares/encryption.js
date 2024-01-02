/** @format */

const crypto = require("crypto");
const dotenv = require("dotenv");
const logger = require("../logger/logger");
const statsdClient = require("../statsd/statsd");
const { getParameter } = require("../parameter-store/variableManager");

dotenv.config();

let cryptoKeyValue, cryptoAlgorithmValue;

async () => {
  logger.info("METHOD: Accessing Parameter Store in Encryption");
  statsdClient.increment(
    "api.calls.method.ACCESSING_PARAMETER_STORE_IN_Encryption"
  );
  try {
    cryptoKeyValue = await getParameter("CRYPTO_KEY");
    cryptoAlgorithmValue = await getParameter("CRYPTO_ALGORITHM");
  } catch (error) {
    logger.info("METHOD: Error Retrieving Parameter from Parameter Store");
    statsdClient.increment("api.calls.method.ERROR_FROM_PARAMETER_STORE");
  }
};

const key = Buffer.from(cryptoKeyValue, "hex");
const ivLength = 16;

const encrypt = (text) => {
  const iv = crypto.randomBytes(ivLength);
  let cipher = crypto.createCipheriv(cryptoAlgorithmValue, key, iv);
  let encrypted = cipher.update(Buffer.from(text));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  logger.info("DATA ENCRYPTED");
  statsdClient.increment("api.calls.encryptionFunction.DataEncrypted");
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

const decrypt = (text) => {
  let textParts = text.split(":");
  let iv = Buffer.from(textParts[0], "hex");
  let encryptedText = Buffer.from(textParts[1], "hex");
  let decipher = crypto.createDecipheriv(cryptoAlgorithmValue, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  logger.info("DATA DECRYPTED");
  statsdClient.increment("api.calls.encryptionFunction.DataDecrypted");
  return decrypted.toString();
};

module.exports = { encrypt, decrypt };

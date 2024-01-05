/** @format */

const crypto = require("crypto");
const dotenv = require("dotenv");
const logger = require("../logger/logger");
const statsdClient = require("../statsd/statsd");
const { getParameter } = require("../parameter-store/parameters");

dotenv.config();

getParameter("CRYPTO_KEY").then((cryptoKey) => {
  getParameter("CRYPTO_ALGORITHM").then((cryptoAlgorithm) => {
    const key = Buffer.from(cryptoKey, "hex");
    const ivLength = 16;

    const encrypt = (text) => {
      const iv = crypto.randomBytes(ivLength);
      let cipher = crypto.createCipheriv(cryptoAlgorithm, key, iv);
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
      let decipher = crypto.createDecipheriv(cryptoAlgorithm, key, iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      logger.info("DATA DECRYPTED");
      statsdClient.increment("api.calls.encryptionFunction.DataDecrypted");
      return decrypted.toString();
    };
    module.exports = { encrypt, decrypt };
  });
});

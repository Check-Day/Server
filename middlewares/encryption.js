/** @format */

const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

const key = Buffer.from(process.env.CRYPTO_KEY, "hex");
const ivLength = 16;

const encrypt = (text) => {
  const iv = crypto.randomBytes(ivLength);
  let cipher = crypto.createCipheriv(process.env.CRYPTO_ALGORITHM, key, iv);
  let encrypted = cipher.update(Buffer.from(text));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

const decrypt = (text) => {
  let textParts = text.split(":");
  let iv = Buffer.from(textParts[0], "hex");
  let encryptedText = Buffer.from(textParts[1], "hex");
  let decipher = crypto.createDecipheriv(process.env.CRYPTO_ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

module.exports = { encrypt, decrypt };

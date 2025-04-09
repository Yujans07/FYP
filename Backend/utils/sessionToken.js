// utils/sessionToken.js

const crypto = require("crypto");

exports.generateSessionToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

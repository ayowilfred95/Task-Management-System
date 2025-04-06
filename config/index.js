const dotenv = require("dotenv");
dotenv.config();

exports.app = {
  name: "Task Management System",
  port: process.env.APP_PORT || 5001,
  secureKey: process.env.APP_SECURE_KEY,
};
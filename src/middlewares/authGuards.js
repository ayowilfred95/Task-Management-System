const jwt = require("jsonwebtoken");
const config = require("../../config");
const { apiResponse, authenticationError } = require("../../lib/helpers/app");

exports.authGuard = async (req, res, next) => {
  try {
    if (!req.header("Authorization"))
      throw authenticationError("Authentication required");
    const token = req.header("Authorization").replace("Bearer ", "");
    const { userId, tokenType } = jwt.verify(token, config.app.secureKey);
    if (tokenType != "ACCESS")
      throw authenticationError("Invalid authentication token type");
    req.token = token;
    req.userId = userId;
    next();
  } catch (error) {
    let errorCode = 401;
    return apiResponse(res, {
      error,
      code: errorCode,
      success: false,
    });
  }
};


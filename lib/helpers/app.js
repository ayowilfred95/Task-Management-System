const { JoiValidationError, AuthenticationError, NotFoundError } = require("./errors");

/**
 * Utility functions for string manipulation and hashing
 */


exports.hash = (string) => {
  //hash and return string
  return string;
};

exports.firstCapilatized = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.camelCase = (string) => {
  return string
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
};

exports.upperCamelCase = (string) => {
  string = this.camelCase(string);
  string = this.firstCapilatized(string);
  return string;
};

exports.hashGenerate = (string) => {
  const saltRounds = 10;
  const bcrypt = require("bcrypt");
  return bcrypt.hashSync(string, saltRounds);
};

exports.hashCompare = (string, hash) => {
  const bcrypt = require("bcrypt");
  return bcrypt.compareSync(string, hash);
};


// Mocked function for Notification
exports.mockNotification = (assigneeId,taskId) => {
    return console.log(`User ${assigneeId} has been assigned task ${taskId}. Notification sent!`);
}
  

// Response

exports.validationError = (message, error = null) => {
  errorMessage = message || "There was an error processing your request";
  return new JoiValidationError(errorMessage, error);
};

exports.authenticationError = (message, error = null) => {
  errorMessage = message || "There was an authenticating request";
  return new AuthenticationError(errorMessage, error);
};

exports.notFoundError = (message, error = null) => {
    let statusCode = 404;

  errorMessage = message || "Not found";
  return new NotFoundError(errorMessage, error);
};

exports.appError = (error) => {
  return error instanceof Error ? error : new Error(error);
};

exports.apiResponse = (res, { code, success, message, data, error }) => {
  let statusCode;
  let responseError;
  let responseMessage;

  if (code) {
    statusCode = code;
  } else if (error == null) {
    statusCode = 200;
  } else {
    statusCode = getErrorCode(error);
  }

  if (message) {
    responseMessage = message;
  } else if (error) {
    responseMessage = getErrorMessage(error);
  }

  if (error) {
    logError(error);
    responseError = getErrorObject(error);
  }

  return res.status(statusCode).send({
    success,
    data,
    error: responseError,
    message: responseMessage,
  });
};


getErrorCode = (error) => {
  let errorCode = 500;
  if (error instanceof JoiValidationError) errorCode = error.getErrorCode();
  if (error instanceof AuthenticationError) errorCode = error.getErrorCode();
  return errorCode;
};

getErrorObject = (error) => {
  let errorObject;
  if (error instanceof JoiValidationError) errorObject = error.getErrorObject();
  if (error instanceof AuthenticationError)
    errorObject = error.getErrorObject();
  return errorObject;
};

getErrorMessage = (error) => {
  let errorMessage = "There was an error processing your request";
  if (error?.message) errorMessage = error?.message;
  if (error?.name === "TokenExpiredError") errorMessage = "Expired jwt token";
  return errorMessage;
};

logError = (error) => {
  let errorLines = error.stack.split("\n");
  let errorMessage = errorLines[0];
  let errorDetails = errorLines[1];
  let errorLineNumber = errorDetails.split(":").reverse()[1];
  let errorFunctionName = errorDetails.split(" ")[5];
  let errorFileName = errorDetails.split(" ")[5];
//   console.log(error);
};

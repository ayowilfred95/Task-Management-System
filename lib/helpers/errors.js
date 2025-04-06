// Error classes

class JoiValidationError extends Error {
  error;
  constructor(message, _error = null) {
    super(message);
    this.error = _error;
  }

  getErrorObject() {
    let errorObject;
    if (this.error?.details && Array.isArray(this.error.details)) {
      this.error.details.map((detail) => {
        errorObject[detail.context.key] = detail.message;
      });
    }
    return errorObject;
  }

  getErrorCode() {
    return 400;
  }
}

// Authentication errors

class AuthenticationError extends Error {
  error;
  constructor(message, _error = null) {
    super(message);
    this.error = _error;
  }

  getErrorObject() {
    let errorObject;
    return errorObject;
  }

  getErrorCode() {
    return 401;
  }
}

// Not found errors

class NotFoundError extends Error {
  error;
  constructor(message, _error = null) {
    super(message);
    this.error = _error;
  }

  getErrorObject() {
    let errorObject;
    return errorObject;
  }

  getErrorCode() {
    return 404;
  }
}

module.exports = {
  JoiValidationError,
  AuthenticationError,
  NotFoundError,
};

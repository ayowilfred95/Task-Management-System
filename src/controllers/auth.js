const joi = require("joi");
const valid = require("../../lib/helpers/valid");
const { apiResponse, validationError } = require("../../lib/helpers/app");
const { AuthService } = require("../services");

// Register Regular User
exports.register = async (req, res) => {
  try {
    // Validate input
    const validator = joi.object({
      firstName: valid.shortString("First name").required(),
      lastName: valid.shortString("Last name").required(),
      email: valid.email("Email").required(),
      password: valid.password("Password").required(),
      role: valid.string("Role").valid("REGULAR", "ADMIN").required(),
    });
    const validated = validator.validate(req.body);
    if (validated.error)
      throw validationError(validated.error.details[0].message);
    const { firstName, lastName, email, password, role } = validated.value;
    // Signup user
    const response = await AuthService.register({
      firstName,
      lastName,
      email,
      password,
      role,
    });
    return apiResponse(res, {
      success: true,
      message: "Signup successful",
      data: response,
    });
  } catch (error) {
    return apiResponse(res, {
      error,
      success: false,
    });
  }
};

// login
exports.login = async (req, res) => {
  try {
    const validator = joi.object({
      email: valid.email("Email").required(),
      password: valid.password("Password").required(),
    });
    const validation = validator.validate(req.body);
    if (validation.error)
      throw validationError(validation.error.details[0].message);
    const {} = validation.value;
    // login user
    const response = await AuthService.login(validation.value);
    return apiResponse(res, {
      success: true,
      message: "Login successfull",
      data: response,
    });
  } catch (error) {
    return apiResponse(res, {
      error,
      success: false,
    });
  }
};

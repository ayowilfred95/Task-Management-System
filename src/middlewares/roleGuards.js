const { appError, apiResponse } = require("../../lib/helpers/app");
const { UserDAO } = require("../dao");

exports.adminGuard = async (req, res, next) => {
  try {
    let user = await UserDAO.fetchOne({ id: req.userId });
    if (!user || user.isAdmin !== true) throw appError("Permission denied");
    next();
  } catch (error) {
    let errorCode = 403;
    let errorMessage = "Permission denied";
    return apiResponse(res, {
      error,
      code: errorCode,
      success: false,
      message: errorMessage,
    });
  }
};

exports.regularGuard = async (req, res, next) => {
  try {
    let user = await UserDAO.fetchOne({ id: req.userId });
    if (!user || user.isRegular !== true) throw appError("Permission denied");
    next();
  } catch (error) {
    let errorCode = 403;
    let errorMessage = "Permission denied";
    return apiResponse(res, {
      error,
      code: errorCode,
      success: false,
      message: errorMessage,
    });
  }
};

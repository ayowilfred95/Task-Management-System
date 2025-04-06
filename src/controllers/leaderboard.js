const joi = require("joi");
const { apiResponse } = require("../../lib/helpers/app");
const { TaskDAO } = require("../dao");
const valid = require("../../lib/helpers/valid");

exports.rankSummary = async (req, res) => {
  try {
    let where = {};
    let { values: params } = valid.query(req.query, {
      q: joi.any(),
      page: valid.number(),
      limit: valid.number(),
    });

    let { values: query } = valid.query(
      params.q,
      {
        priority: joi.string(),
        status: joi.string(),
        dueDate: valid.date(),
      },
      true
    );

    if (query) where = { ...where, ...query };
    let include = [];

    const { data: completedTasksByCreator, pagination } =
      await TaskDAO.fetchCompletedByCreatorOrAssignee(where, {
        attributes: ["firstName", "lastName"],
        include,
        page: params.page,
        limit: params.limit ?? 10,
      });

    let response = {
      completedTasksByCreator,
      pagination,
    };

    return apiResponse(res, {
      success: true,
      data: response,
    });
  } catch (error) {
    return apiResponse(res, {
      error,
      success: false,
    });
  }
};

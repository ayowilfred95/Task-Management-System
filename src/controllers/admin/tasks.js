const joi = require("joi");
const {
  notFoundError,
  validationError,
  apiResponse,
  mockNotification,
} = require("../../../lib/helpers/app");
const valid = require("../../../lib/helpers/valid");
const { TaskDAO, UserDAO } = require("../../dao");
const moment = require("moment");

exports.getAll = async (req, res) => {
  try {
    let where;
    let { values: params } = valid.query(req.query, {
      q: joi.any(),
      order: joi.any(),
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

    let { values: order } = valid.query(params.order, {
      id: joi.valid("ASC", "DESC"),
      createdAt: joi.valid("ASC", "DESC"),
    });

    let defaultOrder = {
      id: "DESC",
    };

    order = order ? { ...order, ...defaultOrder } : defaultOrder;

    if (query) where = { ...where, ...query };
    let include = [
      [
        "creator",
        { attributes: ["id", "firstName", "lastName", "isAdmin", "isRegular"] },
      ],
      [
        "assignee",
        { attributes: ["id", "firstName", "lastName", "isAdmin", "isRegular"] },
      ],
    ];

    const { data: tasks, pagination } = await TaskDAO.fetchAll(where, {
      include,
      order,
      page: params.page,
      limit: params.limit ?? 10,
    });

    const response = {
      tasks,
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

exports.getOne = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const task = await TaskDAO.fetchOne(
      { id },
      {
        include: [
          [
            "creator",
            {
              attributes: [
                "id",
                "firstName",
                "lastName",
                "isAdmin",
                "isRegular",
              ],
            },
          ],
          [
            "assignee",
            {
              attributes: [
                "id",
                "firstName",
                "lastName",
                "isAdmin",
                "isRegular",
              ],
            },
          ],
        ],
      }
    );
    if (!task) throw notFoundError("task not found");
    const response = {
      task,
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

exports.delete = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const task = await TaskDAO.fetchOne({ id });
    if (!task) throw notFoundError();
    await TaskDAO.delete({ id });
    return apiResponse(res, {
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return apiResponse(res, {
      error,
      success: false,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const task = await TaskDAO.fetchOne({ id });
    if (!task) throw notFoundError();
    const validator = joi.object({
      title: valid.string("Title"),
      description: valid.string("Description"),
      priority: valid.string("Priority").valid("LOW", "MEDIUM", "HIGH"),
      dueDate: valid.date("Due Date"),
      status: valid.string("Status").valid("TODO", "IN_PROGRESS", "COMPLETED"),
    });
    const validated = validator.validate(req.body);
    if (validated.error)
      throw validationError(validated.error.details[0].message);
    const { title, description, priority, dueDate, status } = validated.value;
    if (moment(dueDate).isBefore())
      throw validationError("Due date cannot be in the past");
    let image = null;
    if (req.file) {
      image = req.file.filename;
    }
    const updatedTask = await TaskDAO.update(
      {
        title,
        description,
        priority,
        dueDate,
        status,
        image,
      },
      { id }
    );
    const response = {
      task: updatedTask,
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

exports.updateStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const task = await TaskDAO.fetchOne({ id });
    if (!task) throw notFoundError("Task not found");
    const validator = joi.object({
      status: valid.string("Status").valid("TODO", "IN_PROGRESS", "COMPLETED"),
    });
    const validated = validator.validate(req.body);
    if (validated.error)
      throw validationError(validated.error.details[0].message);
    const {} = validated.value;
    const updatedTask = await TaskDAO.update(validated.value, { id });
    const response = {
      task: updatedTask,
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

exports.assign = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const task = await TaskDAO.fetchOne({ id });
    if (!task) throw notFoundError("Task not found");
    const validator = joi.object({
      assigneeId: valid.number("Assignee ID").required(),
    });
    const validated = validator.validate(req.body);
    if (validated.error)
      throw validationError(validated.error.details[0].message);
    const { assigneeId } = validated.value;

    const assignee = await UserDAO.fetchOne({
      id: assigneeId,
      isRegular: true,
    });
    if (!assignee) throw notFoundError("user does not exist");
    if (assignee.id === task.creatorId)
      throw validationError(
        "You cannot assign task to the original creator of this task"
      );

    if (task.status === "COMPLETED")
      throw validationError(
        "Task is already completed and cannot be re-assigned"
      );

    const updatedTask = await TaskDAO.update({ assigneeId }, { id });
    mockNotification(assigneeId, id);
    const response = {
      task: updatedTask,
      message: `Email notification sent successfully to ${assignee.firstName} ${assignee.lastName}`,
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

// Get a task assign to a user
exports.getAssignTasksToUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await UserDAO.fetchOne({ id });
    if (!user) throw notFoundError("User not found");

    let { values: params } = valid.query(req.query, {
      q: joi.any(),
      order: joi.any(),
      page: valid.number(),
      limit: valid.number(),
    });

    let { values: order } = valid.query(params.order, {
      id: joi.valid("ASC", "DESC"),
      createdAt: joi.valid("ASC", "DESC"),
    });

    let defaultOrder = {
      id: "DESC",
    };

    order = order ? { ...order, ...defaultOrder } : defaultOrder;

    let include = ["creator", "assignee"];
    const {data:tasks, pagination} = await TaskDAO.fetchAll({ assigneeId: id },{
      include,
      order,
      page: params.page,
      limit: params.limit ?? 10,
    });
    const response = {
      tasks,
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

const joi = require("joi");
const {
  appError,
  notFoundError,
  validationError,
  apiResponse,
  mockNotification,
} = require("../../../lib/helpers/app");
const valid = require("../../../lib/helpers/valid");
const { TaskDAO, UserDAO } = require("../../dao");
const moment = require("moment");

exports.create = async (req, res) => {
  try {
    const userId = req.userId;
    const validator = joi.object({
      title: valid.string("Title").required(),
      description: valid.longString("Description").required(),
      priority: valid.string("Priority").valid("LOW", "MEDIUM", "HIGH"),
      dueDate: valid.date("Due Date"),
    });
    const validated = validator.validate(req.body);
    if (validated.error)
      throw validationError(validated.error.details[0].message);
    const { title, description, priority, dueDate } = validated.value;

    if (moment(dueDate).isBefore())
      throw validationError("Due date cannot be in the past");

    // console.log("req.file...........:", req.file);
    // Handle file uploads
    let image = null;
    if (req.file) {
      image = req.file.filename;
    }

    const task = await TaskDAO.create({
      title,
      description,
      priority,
      dueDate,
      creatorId: userId,
      image,
    });
    const response = {
      task,
    };
    return apiResponse(res, {
      success: true,
      message: "Task created successfully",
      data: response,
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
    const userId = req.userId;
    const id = parseInt(req.params.id);
    const task = await TaskDAO.fetchOne({ id, creatorId: userId });
    if (!task)
      throw notFoundError("Task not found or does not belong to this user");
    const validator = joi.object({
      title: valid.string("Title").required(),
      description: valid.string("Description").required(),
      // image: valid.url('Image'),
      priority: valid
        .string("Priority")
        .valid("LOW", "MEDIUM", "HIGH")
        .required(),
      dueDate: valid.date("Due Date").required(),
      status: valid
        .string("Status")
        .valid("TODO", "IN_PROGRESS", "COMPLETED")
        .required(),
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
    const userId = req.userId;
    const id = parseInt(req.params.id);
    const task = await TaskDAO.fetchOne({ id, creatorId: userId });
    if (!task) throw notFoundError("Task does not belong to this user");
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

exports.delete = async (req, res) => {
  try {
    const userId = req.userId;
    const id = parseInt(req.params.id);
    const task = await TaskDAO.fetchOne({ id, creatorId: userId });
    if (!task)
      throw notFoundError("Task not found or does not belong to this user");
    if (task.status === "IN_PROGRESS")
      throw appError("Task cannot be deleted when it is in progress");
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

exports.getOne = async (req, res) => {
  try {
    const userId = req.userId;
    const id = parseInt(req.params.id);
    const task = await TaskDAO.fetchOne(
      { id, creatorId: userId },
      { include: ["assignee"] }
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

exports.getAll = async (req, res) => {
  try {
    const userId = req.userId;
    let where = { creatorId: userId };
    let { values: params } = valid.query(req.query, {
      q: joi.any(),
      order: {
        createdAt: joi.valid("ASC", "DESC"),
      },
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

exports.assign = async (req, res) => {
  try {
    const userId = req.userId;
    const id = parseInt(req.params.id);
    const task = await TaskDAO.fetchOne({ id, creatorId: userId });
    if (!task) throw notFoundError("Task does not belong to this user");
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
    if (assignee.id === userId)
      throw validationError("user cannot assign task to himself");

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

exports.getAssignTasks = async (req, res) => {
  try {
    const userId = req.userId;
    let where = { assigneeId: userId };
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

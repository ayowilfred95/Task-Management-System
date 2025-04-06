const { Task, User, sequelize } = require("../models");
const { appError } = require("../../lib/helpers/app");
const BaseDAO = require("./base-dao");

class TaskDAO extends BaseDAO {
  constructor() {
    super(Task);
  }

  /**
   * completionRate =
   * totalTasks /
   * completedTasks
   */
  fetchCompletedByCreatorOrAssignee = async (
    where = null,
    { scope, attributes, include, order, limit, page = 1 } = {}
  ) => {
    try {
      let data = {
        nest: true,
        distinct: true,
        where: {},
        attributes: [
          "firstName",
          "lastName",
          [
            sequelize.literal(
              `(SELECT COUNT(id) FROM tasks 
                WHERE (tasks.CreatorId = User.id OR tasks.AssigneeId = User.id) 
                AND tasks.status = 'COMPLETED' 
                AND ISNULL(tasks.deletedAt))`
            ),
            "completedTasks",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(id) FROM tasks 
                WHERE (tasks.CreatorId = User.id OR tasks.AssigneeId = User.id) 
                AND ISNULL(tasks.deletedAt))`
            ),
            "totalTasks",
          ],
          [
            sequelize.literal(
              `IFNULL(
                (
                  (SELECT COUNT(id) FROM tasks 
                   WHERE (tasks.CreatorId = User.id OR tasks.AssigneeId = User.id) 
                   AND tasks.status = 'COMPLETED' 
                   AND ISNULL(tasks.deletedAt)
                  ) * 100 /
                  NULLIF(
                    (SELECT COUNT(id) FROM tasks 
                     WHERE (tasks.CreatorId = User.id OR tasks.AssigneeId = User.id) 
                     AND ISNULL(tasks.deletedAt)
                    ), 0
                  )
                ), 0
              )`
            ),
            "completionRate",
          ],
          [
            sequelize.literal(
              `RANK() OVER (
                ORDER BY 
                  IFNULL(
                    (SELECT COUNT(id) FROM tasks 
                    WHERE (tasks.CreatorId = User.id OR tasks.AssigneeId = User.id) 
                    AND tasks.status = 'COMPLETED' 
                    AND ISNULL(tasks.deletedAt)) /
                    NULLIF(
                      (SELECT COUNT(id) FROM tasks 
                      WHERE (tasks.CreatorId = User.id OR tasks.AssigneeId = User.id) 
                      AND ISNULL(tasks.deletedAt)), 0),
                    0
                  ) DESC, 
                  (SELECT COUNT(id) FROM tasks 
                  WHERE (tasks.CreatorId = User.id OR tasks.AssigneeId = User.id) 
                  AND tasks.status = 'COMPLETED' 
                  AND ISNULL(tasks.deletedAt)) DESC
              )`
            ),
            "rank",
          ],
        ],
        order: [
          [sequelize.literal("completionRate"), "DESC"],
          [sequelize.literal("completedTasks"), "DESC"],
        ],
      };

      if (where) data.where = { ...data.where, ...this.createWhere(where) };
      if (attributes) data.attributes = [...attributes, ...data.attributes];
      if (include) data.include = this.createInclude(include);
      if (limit) {
        data.limit = Number(limit);
        if (page) data.offset = (Number(page) - 1) * Number(limit);
      }
      if (order) data.order.push(...this.createOrder(order));

      // Fetching the data
      const result = scope
        ? await User.scope(scope).findAndCountAll(data)
        : await User.findAndCountAll(data);

      // Format completionRate to remove .0000
      result.rows.forEach((user) => {
        console.log("User Object: ", user.dataValues); // Log the entire user object

        // Explicitly access the completionRate from the dataValues
        const completionRate = user.dataValues.completionRate;

        // Check if completionRate exists and is not null or undefined
        if (completionRate !== undefined && completionRate !== null) {
          // Ensure it's a number and format correctly
          let formattedCompletionRate = parseFloat(completionRate).toFixed(2);

          // Remove ".00" if the value is a whole number
          formattedCompletionRate = formattedCompletionRate.replace(
            /\.00$/,
            ""
          );

          // Update user object with the formatted completion rate
          user.dataValues.completionRate = formattedCompletionRate;
        }
      });

      // Paginate response format
      const pagination = {
        total: result.count,
        pages: Math.ceil(result.count / limit),
        page: page,
        rows: result.count,
      };

      // console.log("result.rows...............:",result.rows);

      return {
        data: result.rows,
        pagination,
      };
    } catch (error) {
      throw appError(error);
    }
  };
}

module.exports = new TaskDAO();

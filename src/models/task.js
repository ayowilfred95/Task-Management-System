"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      models.Task.belongsTo(models.User, { as: "assignee", foreignKey: "assigneeId" });
      models.Task.belongsTo(models.User, { as: "creator", foreignKey: "creatorId" });
    }
  }

  Task.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      assigneeId: { type: DataTypes.INTEGER },
      creatorId: { type: DataTypes.INTEGER },
      image: { type: DataTypes.STRING },
      title: { type: DataTypes.STRING },
      description: { type: DataTypes.TEXT },
      priority: { type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH") }, // LOW, MEDIUM, HIGH
      status: {
        type: DataTypes.ENUM("TODO", "IN_PROGRESS", "COMPLETED"),
        defaultValue: "TODO",
      }, // TODO, IN_PROGRESS, COMPLETED
      dueDate: { type: DataTypes.DATE },
    },
    {
      sequelize,
      modelName: "Task",
      tableName: "tasks",
      // Soft deletion
      paranoid: true,
    }
  );

  //   Task.sync({ alter: true });

  return Task;
};

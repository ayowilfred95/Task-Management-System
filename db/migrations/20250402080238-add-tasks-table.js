'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      assigneeId: { 
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      creatorId: { 
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      image: { 
        type: Sequelize.STRING,
        allowNull: true,
      },
      title: { 
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: { 
        type: Sequelize.TEXT,
        allowNull: true,
      },
      priority: { 
        type: Sequelize.ENUM("LOW", "MEDIUM", "HIGH"),
        allowNull: true,
      },
      status: { 
        type: Sequelize.ENUM("TODO", "IN_PROGRESS", "COMPLETED"),
        defaultValue: "TODO",
        allowNull: true,
      },
      dueDate: { 
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('tasks');
  }
};

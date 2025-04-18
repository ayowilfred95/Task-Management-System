"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      firstName: { 
        type: Sequelize.STRING,
        allowNull: false 
      },
      lastName: { 
        type: Sequelize.STRING,
        allowNull: false 
      },
      email: { 
        type: Sequelize.STRING,
        allowNull: false,
        unique: true 
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isRegular: { 
        type: Sequelize.BOOLEAN,
        defaultValue: true 
      },
      isAdmin: { 
        type: Sequelize.BOOLEAN,
        defaultValue: false 
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};

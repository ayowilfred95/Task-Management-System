"use strict";
const { Model } = require("sequelize");
const { hashGenerate } = require("../../lib/helpers/app");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {}
  }
  User.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      firstName: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      lastName: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      email: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true 
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          const hashedPassword = hashGenerate(value);
          this.setDataValue("password", hashedPassword);
        },
      },
      isRegular: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: true 
      },
      isAdmin: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      // Soft deletion
      paranoid: false,
      defaultScope: {
        attributes: { exclude: ["password"] },
      },
      scopes: {
        withPassword: {
          attributes: {},
        },
      },
    }
  );

  // User.sync({ alter: true  });
  return User;
};

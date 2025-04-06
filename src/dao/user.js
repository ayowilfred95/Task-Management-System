const { User } = require("../models");

const BaseDAO = require("./base-dao");

class UserDAO extends BaseDAO {
  constructor() {
    super(User);
  }
}

module.exports = new UserDAO();

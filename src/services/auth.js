const jwt = require("jsonwebtoken");
const { UserDAO } = require("../dao");
const config = require("../../config");
const { appError, hashCompare } = require("../../lib/helpers/app");

exports.register = async (data) => {
  try {
    // Check if user exists
    const emailExist = await UserDAO.exist({ email: data.email });

    if (emailExist)
      throw appError("User with this email address already exists");

    if (!data.firstName || !data.lastName) {
      throw appError("First name and last name are required");
    }

    let newUser;

    if (data.role === "ADMIN") {
      newUser = await UserDAO.create({
        ...data,
        isRegular: false,
        isAdmin: true,
      });
    } else {
      newUser = await UserDAO.create(data);
    }

    let user = JSON.parse(JSON.stringify(newUser));
    delete user.password;

    const token = jwt.sign(
      {
        userId: user.id,
        tokenType: "VERIFY",
      },
      config.app.secureKey,
      { expiresIn: "1h" }
    );
    return {
      user,
      token,
    };
  } catch (error) {
    throw appError(error);
  }
};

exports.login = async (data) => {
  let accessToken, refreshToken;
  try {
    // Fetch user
    const fetchedUser = await UserDAO.fetchOne(
      { email: data.email },
      {
        scope: "withPassword",
      }
    );
    if (!fetchedUser)
      throw appError("No account associated with this email address");

    // Verify password
    const validpassword = hashCompare(data.password, fetchedUser.password);
    if (!validpassword) throw appError("Invalid password");
    delete fetchedUser.password;

    let user = JSON.parse(JSON.stringify(fetchedUser));

    accessToken = jwt.sign(
      {
        userId: user.id,
        tokenType: "ACCESS",
      },
      config.app.secureKey,
      { expiresIn: "24h" }
    );

    return {
      user,
      accessToken,
    };
  } catch (error) {
    throw appError(error);
  }
};

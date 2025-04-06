const request = require("supertest");
const express = require("express");
const authController = require("../src/controllers/auth");

// Mock Express app
const app = express();
app.use(express.json());

// Mock API routes
app.post("/login", authController.login);
app.post("/register", authController.register);

// Mock UserDAO methods
jest.mock("../src/dao", () => ({
  UserDAO: {
    fetchOne: jest.fn(() =>
      Promise.resolve({ id: 1, email: "taskuser@gmail.com" })
    ),
    createUser: jest.fn(() =>
      Promise.resolve({ id: 1, email: "taskuser@gmail.com" })
    ),
    exist: jest.fn((email) => {
      if (email === "taskuser@gmail.com") {
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    }),
  },
}));

jest.mock("../src/services/auth", () => ({
  register: jest.fn(),
  login: jest.fn(),
}));

describe("Auth Controller Tests", () => {
  test("should register a new user successfully", async () => {
    require("../src/services/auth").register.mockResolvedValue({
      id: 1,
      email: "newuser@gmail.com",
      firstName: "taskuser",
      lastName: "taskuser",
      isRegular: true,
    });

    const response = await request(app).post("/register").send({
      firstName: "taskuser",
      lastName: "taskuser",
      email: "newuser@gmail.com",
      password: "@Password123",
      role: "REGULAR",
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("should register a new admin successfully", async () => {
    require("../src/services/auth").register.mockResolvedValue({
      id: 1,
      email: "newadmin@gmail.com",
      firstName: "taskadmin",
      lastName: "taskadmin",
      isAdmin: true,
    });

    const response = await request(app).post("/register").send({
      firstName: "taskadmin",
      lastName: "taskadmin",
      email: "newadmin@gmail.com",
      password: "@Password123",
      role: "ADMIN",
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("should return validation error for invalid registration", async () => {
    const response = await request(app).post("/register").send({
      firstName: "taskuser",
      lastName: "taskuser",
      email: "taskuser@gmail.com",
      password: "passworddonotvalidate",
    });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("should return user already exists error for duplicate email", async () => {
    require("../src/services/auth").register.mockRejectedValue(
      new Error("User already exists")
    );

    const response = await request(app).post("/register").send({
      firstName: "taskuser",
      lastName: "taskuser",
      email: "taskuser@gmail.com",
      password: "@Password123",
      role: "REGULAR",
    });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("User already exists");
  });

  test("should login a user successfully", async () => {
    require("../src/services/auth").login.mockResolvedValue({
      user: { id: 1, email: "taskuser@gmail.com" },
      accessToken: "mockAccessToken",
    });

    const response = await request(app).post("/login").send({
      email: "taskuser@gmail.com",
      password: "@Password123",
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("should return validation error for invalid login", async () => {
    const response = await request(app).post("/login").send({
      email: "taskuser@gmail.com",
      password: "passworddonotvalidate",
    });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("should return user not found error for non-existent user", async () => {
    require("../src/services/auth").login.mockRejectedValue(
      new Error("User not found")
    );

    const response = await request(app).post("/login").send({
      email: "nonexistentuser@gmail.com",
      password: "@Password123",
    });
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("User not found");
  });
});

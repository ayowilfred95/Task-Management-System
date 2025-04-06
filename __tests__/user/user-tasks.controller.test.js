const request = require("supertest");
const express = require("express");
const userTasksController = require("../../src/controllers/user/tasks");
const multer = require("multer");
const path = require("path");

// Mock Express app
const app = express();
app.use(express.json());

// ✅ Middleware to simulate authenticated user
app.use((req, res, next) => {
  req.userId = 1;
  next();
});

const mockMulter = multer().single("image");

// Mock API routes
app.post("/tasks", mockMulter, userTasksController.create);
app.put("/tasks/:id", mockMulter, userTasksController.update);
app.delete("/tasks/:id", userTasksController.delete);
app.get("/tasks/:id", userTasksController.getOne);
app.get("/tasks", userTasksController.getAll);
app.put("/tasks/:id/update-status", userTasksController.updateStatus);

// Fix: Ensure `joi` is required inside the mock function
jest.mock("../../lib/helpers/valid", () => {
  const joi = require("joi");
  return {
    string: jest.fn(() => joi.string()),
    longString: () => joi.string().min(10).required(),
    date: jest.fn(() => joi.date()),
    number: jest.fn(() => joi.number()),
    query: jest.fn((query, schema) => ({ values: query })),
  };
});

// Mock TaskDAO methods
jest.mock("../../src/dao", () => ({
  TaskDAO: {
    create: jest.fn((task) => Promise.resolve({ id: 1, ...task })),
    fetchOne: jest.fn((query) =>
      Promise.resolve(query.id === 1 ? { id: 1, title: "Test Task" } : null)
    ),
    update: jest.fn((updates, query) =>
      Promise.resolve({ id: query.id, ...updates })
    ),
    delete: jest.fn(() => Promise.resolve()),
    fetchAll: jest.fn(() =>
      Promise.resolve({
        data: [
          { id: 1, title: "Task 1" },
          { id: 2, title: "Task 2" },
        ],
        pagination: { total: 2 },
      })
    ),
  },
}));

describe("Task Controller Tests", () => {
  test("should create a task successfully", async () => {
    const response = await request(app)
      .post("/tasks")
      .set("Content-Type", "multipart/form-data")
      .field("title", "New Task")
      .field("description", "Task description")
      .field("priority", "HIGH")
      .field("dueDate", "2025-04-10")
      .attach("image", path.resolve(__dirname, "../../images/test-image.jpg"));

    // console.log("Response body.............:", response.body);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.task).toHaveProperty("id");
  });

  test("should return validation error for invalid task creation", async () => {
    const response = await request(app)
      .post("/tasks")
      .send({ title: "", description: "" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("should fetch a task by ID", async () => {
    const response = await request(app).get("/tasks/1");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.task).toHaveProperty("title", "Test Task");
  });

  test("should return 404 for non-existent task", async () => {
    const response = await request(app).get("/tasks/999");
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("task not found");
  });

  test("should return validation error if dueDate is in the past", async () => {
    const response = await request(app)
      .post("/tasks")
      .set("Content-Type", "multipart/form-data")
      .field("title", "New Task")
      .field("description", "Task description")
      .field("priority", "HIGH")
      .field("dueDate", "2024-04-10"); 
  
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Due date cannot be in the past");
  });

  test("should update a task successfully", async () => {
    const response = await request(app)
      .put("/tasks/1")
      .set("Content-Type", "multipart/form-data")
      .field("title", "Updated Task")
      .field("description", "Updated description")
      .field("priority", "HIGH")
      .field("dueDate", "2025-04-10")
      .field("status", "IN_PROGRESS")
      .attach("image", path.resolve(__dirname, "../../images/test-image.jpg"));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.task).toHaveProperty("title", "Updated Task");
  });

  test("should update a task status successfully", async () => {
    const response = await request(app)
      .put("/tasks/1/update-status")
      .send({ status: "IN_PROGRESS" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.task).toHaveProperty("status", "IN_PROGRESS");
  });

  test("should delete a task successfully", async () => {
    const response = await request(app).delete("/tasks/1");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Task deleted successfully");
  });

  test("should fetch all tasks", async () => {
    const response = await request(app).get("/tasks");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tasks.length).toBeGreaterThan(0);
  });
});

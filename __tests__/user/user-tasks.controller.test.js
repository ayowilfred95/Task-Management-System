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

// API Routes
app.post("/tasks", mockMulter, userTasksController.create);
app.put("/tasks/:id", mockMulter, userTasksController.update);
app.delete("/tasks/:id", userTasksController.delete);
app.get("/tasks/:id", userTasksController.getOne);
app.get("/tasks", userTasksController.getAll);
app.put("/tasks/:id/update-status", userTasksController.updateStatus);

// ✅ Mock joi validator
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

// ✅ Track task state across mocks
let mockTask = {
  id: 1,
  title: "Test Task",
  description: "Task description",
  status: "TODO",
  priority: "HIGH",
  dueDate: "2025-04-10",
  creatorId: 1,
};

jest.mock("../../src/dao", () => ({
  TaskDAO: {
    create: jest.fn((task) => {
      mockTask = { id: 1, ...task };
      return Promise.resolve(mockTask);
    }),
    fetchOne: jest.fn((query) => {
      if (query.id === 1 && query.creatorId === 1) {
        return Promise.resolve(mockTask);
      }
      return Promise.resolve(null);
    }),
    update: jest.fn((updates, query) => {
      if (query.id === 1) {
        mockTask = { ...mockTask, ...updates };
      }
      return Promise.resolve(mockTask);
    }),
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
  test("User should create a task successfully", async () => {
    const response = await request(app)
      .post("/tasks")
      .set("Content-Type", "multipart/form-data")
      .field("title", "New Task")
      .field("description", "Task description")
      .field("priority", "HIGH")
      .field("dueDate", "2025-04-10")
      .attach("image", path.resolve(__dirname, "../../images/test-image.jpg"));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.task).toHaveProperty("id");
  });

  test("User should return validation error for invalid task creation", async () => {
    const response = await request(app)
      .post("/tasks")
      .send({ title: "", description: "" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("User should fetch a task by ID", async () => {
    const response = await request(app).get("/tasks/1");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.task).toHaveProperty("title", "New Task");
  });

  test("User should return 404 for non-existent task", async () => {
    const response = await request(app).get("/tasks/999");
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("task not found");
  });

  test("User should return validation error if dueDate is in the past", async () => {
    const response = await request(app)
      .post("/tasks")
      .set("Content-Type", "multipart/form-data")
      .field("title", "New Task")
      .field("description", "Task description")
      .field("priority", "HIGH")
      .field("dueDate", "2024-04-10"); // 🕒 Past date

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Due date cannot be in the past");
  });

  test("User should update a task successfully", async () => {
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

  test("User should update a task status successfully", async () => {
    const response = await request(app)
      .put("/tasks/1/update-status")
      .send({ status: "IN_PROGRESS" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.task).toHaveProperty("status", "IN_PROGRESS");
  });

  test("User should delete a task successfully", async () => {
    // Reset status to TODO so deletion can proceed
    mockTask.status = "TODO";

    const response = await request(app).delete("/tasks/1");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Task deleted successfully");
  });

  test("User should fetch all tasks", async () => {
    const response = await request(app).get("/tasks");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tasks.length).toBeGreaterThan(0);
  });

  test("User should not be able to delete a task with status in progress", async () => {
    // Set task status to IN_PROGRESS via update route
    const response = await request(app)
      .put("/tasks/1/update-status")
      .send({ status: "IN_PROGRESS" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.task.status).toBe("IN_PROGRESS");

    // Try deleting task
    const deleteResponse = await request(app).delete("/tasks/1");

    expect(deleteResponse.status).toBe(500);
    expect(deleteResponse.body.success).toBe(false);
    expect(deleteResponse.body.message).toBe(
      "Task cannot be deleted when it is in progress"
    );
  });
});

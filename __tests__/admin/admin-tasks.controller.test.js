const request = require("supertest");
const express = require("express");
const adminTasksController = require("../../src/controllers/admin/tasks");
const multer = require("multer");
const path = require("path");

// Mock Express app
const app = express();
app.use(express.json());

const mockMulter = multer().single("image");

// Mock API routes
app.put("/tasks/:id", mockMulter, adminTasksController.update);
app.delete("/tasks/:id", adminTasksController.delete);
app.get("/tasks/:id", adminTasksController.getOne);
app.get("/tasks", adminTasksController.getAll);
app.put("/tasks/:id/update-status", adminTasksController.updateStatus);

// Mock joi helper
jest.mock("../../lib/helpers/valid", () => {
  const joi = require("joi");
  return {
    string: jest.fn(() => joi.string()),
    date: jest.fn(() => joi.date()),
    number: jest.fn(() => joi.number()),
    query: jest.fn((query, schema) => ({ values: query })),
  };
});

// Shared mock task (mutable for test updates)
let mockTask = {
  id: 1,
  title: "Test Task",
  description: "A test task",
  priority: "LOW",
  dueDate: "2025-04-15",
  status: "TODO",
  creatorId: 1,
};

// Reset mock task before each test
beforeEach(() => {
  mockTask = {
    id: 1,
    title: "Test Task",
    description: "A test task",
    priority: "LOW",
    dueDate: "2025-04-15",
    status: "TODO",
    creatorId: 1,
  };
});

// Mock TaskDAO
jest.mock("../../src/dao", () => ({
  TaskDAO: {
    fetchOne: jest.fn((query) =>
      Promise.resolve(query.id === 1 ? mockTask : null)
    ),
    update: jest.fn((updates, query) => {
      if (query.id === 1) {
        mockTask = { ...mockTask, ...updates };
        return Promise.resolve(mockTask);
      }
      return Promise.resolve(null);
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
  test("Admin should fetch a task by ID", async () => {
    const response = await request(app).get("/tasks/1");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.task).toHaveProperty("title", "Test Task");
  });

  test("should return 404 for non-existent task for admin", async () => {
    const response = await request(app).get("/tasks/999");
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("task not found");
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

  test("Admin should update a task status successfully", async () => {
    const response = await request(app)
      .put("/tasks/1/update-status")
      .send({ status: "IN_PROGRESS" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.task).toHaveProperty("status", "IN_PROGRESS");
  });

  test("should return validation error if dueDate is in the past", async () => {
    const response = await request(app)
      .put("/tasks/1")
      .set("Content-Type", "multipart/form-data")
      .field("title", "New Task")
      .field("description", "Task description")
      .field("priority", "HIGH")
      .field("dueDate", "2024-04-10");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Due date cannot be in the past");
  });

  test("Admin should delete a task successfully", async () => {
    mockTask.status = "TODO"; // ensure status is deletable
    const response = await request(app).delete("/tasks/1");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("Admin should fetch all tasks", async () => {
    const response = await request(app).get("/tasks");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tasks.length).toBeGreaterThan(0);
  });

  test("Admin should not be able to delete a task with status in progress", async () => {
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

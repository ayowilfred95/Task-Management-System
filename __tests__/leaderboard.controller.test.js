const request = require("supertest");
const express = require("express");
const leaderboardController = require("../src/controllers/leaderboard");

// Mock Express App

const app = express();
app.use(express.json());

// Mock API Routes

app.get("/rank-summary", leaderboardController.rankSummary);

// Mock LeaderboardDAO methods
jest.mock("../src/dao", () => ({
  TaskDAO: {
    fetchCompletedByCreatorOrAssignee: jest.fn(() =>
      Promise.resolve({
        data: [
          {
            id: 1,
            firstName: "User 1",
            lastName: "User 1",
            tasksCompleted: 10,
            completionRate: 100,
            totalTasks: 10,
            rank: 1,
          },
          {
            id: 2,
            firstName: "User 2",
            lastName: "User 2",
            tasksCompleted: 5,
            completionRate: 100,
            totalTasks: 10,
            rank: 2,
          },
          {
            id: 3,
            firstName: "User 3",
            lastName: "User 3",
            tasksCompleted: 3,
            completionRate: 100,
            totalTasks: 10,
            rank: 3,
          },
        ],
        pagination: { total: 3 },
      })
    ),
  },
}));

describe("Leaderboard Controller Tests", () => {
  test("should fetch rank summary successfully", async () => {
    const response = await request(app).get("/rank-summary");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("completedTasksByCreator");
    expect(response.body.data.completedTasksByCreator).toHaveLength(3);
    expect(response.body.data).toHaveProperty("pagination");
    expect(response.body.data.pagination).toHaveProperty("total");
  });
});

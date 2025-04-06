# Task Management System

## Overview

The Task Management System is a web application designed to help users manage their tasks efficiently. It provides features for creating, updating, and deleting tasks by users and admins. This README provides setup instructions, API documentation, an explanation of design decisions, and guidelines for integration testing.

## Setup Instructions

### Prerequisites

- **Docker**: Ensure that Docker is installed on your machine. You need Docker to run the MySQL database. You can download it from [Docker's official website](https://www.docker.com/get-started).
- **Node.js**: Version 14 or higher.
- **npm**: Node Package Manager.

### Installation Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/ayowilfred95/Task-Management-System.git
   cd Task-Management-System
   ```

2. **Set Up the Database Using Docker**

   - There is a file called `docker-compose.yml` in the root directory. It contains the YAML configuration for the MySQL database.
   - Run the following command to start the MySQL database:
   - NOTE: You need to have Docker installed and running on your machine to run this command.

   ```bash
   docker compose up -d
   ```

   This command will start the database in detached mode.

3. **Install Application Dependencies**
   ```bash
   npm install
   ```
4. **Run Tests**

   ```bash
   npm test
   ```

5. **Set Up Environment Variables**
   Create a `.env` file in the root directory and add the following variables:
   ```plaintext
   APP_PORT=4000
   APP_SECURE_KEY=taskmanagement123@#$%!!*&*&^$#etc
   DB_USER=task-management
   DB_PASS=task-management
   DB_NAME=task-management
   DB_HOST=localhost
   DB_CHARSET=utf8mb4
   DB_COLLATE=utf8mb4_unicode_ci
   ```
   **NOTE**:

- You can add any value for the variables and Incase you have a database you can use, set the database credentials with the database you want to use. In that case, instead of DB_USER, DB_PASS, DB_NAME, DB_HOST, DB_CHARSET, DB_COLLATE, use the credentials of the database you want to use.

6. **Run Database Migrations**
   After the database is up and running, run the migrations to set up the database schema:
   ```bash
   npx sequelize-cli db:migrate
   ```
   **NOTE**:

- There are two tables that will be created: `users` and `tasks`.
- The `users` table will be used for authentication and authorization.
- The `tasks` table will be used to store the tasks created by users.

7. **Start the Application**

   ```bash
   npm run start
   ```

8. **Access the Application**
   Open your browser and navigate to `http://localhost:4000`.


### Endpoints

# 📘 Task Management System API Documentation

## 1. API Overview

### 🎯 Purpose & Scope

The **Task Management System API** is a RESTful API designed to streamline task tracking and user administration. The API supports both **regular users** (who can manage personal tasks and also assign tasks to other users) and **administrators** (who can manage all users tasks).

**Key functionalities include:**

- **User Management**: Register, log in, and manage your personal task list.
- **Task Operations**: Create, update, and delete tasks, along with status tracking.
- **Admin Control**: View all users tasks, view tasks for specific users,assign tasks to users and delete users if necessary.

### ✅ Solution Highlights

- **User Tasks**: Users can manage their own task lifecycle — from creation to deletion.
- **Authentication**: Role-based access using token authentication.
- **Admin Oversight**: Admins can manage platform users and inspect any user's tasks.

---

## 🔗 Full Postman API Reference
Postman was used to document the API.
For complete request examples and responses,please visit the postman full docs:  
👉 [Postman Docs](https://documenter.getpostman.com/view/28637839/2sB2cUBi1F)

---

## 2. Workflows

### 🔄 Workflow Scenarios

#### 1. User Registers and Manages Tasks

1. A new user sends a `POST` request to `/auth/register`.
2. Logs in using `/auth/login` to get a JWT token.
3. Creates a task using `POST /users/tasks` with the token.
4. Retrieves tasks via `GET /users/tasks`.
5. Updates or deletes tasks using `PUT` or `DELETE` on `/users/tasks/:id`.
6. Assign a user task: `POST /users/tasks/:id/assign`.
7. Update a user task: `PUT /users/tasks/:id/update`.
8. Update a user task status: `PUT /users/tasks/:id/update-status`.

#### 2. Admin Logs In and Manages Tasks

1. Admin logs in through `POST auth/login`.
2. View all users tasks: `GET /admins/tasks`.
3. Views all tasks for a user: `GET /admins/tasks/:id`.
4. Delete a user task: `DELETE /admins/tasks/:id`.
5. Assign a user task: `POST /admins/tasks/:id/assign`.
6. Update a user task: `PUT /admins/tasks/:id/update`.
7. Update a user task status: `PUT /admins/tasks/:id/update-status`.

---

## 3. Detailed API Specifications

### 🌐 Base URL

```
https://localhost:4000/v1
```

All endpoints are prefixed with this base URL.

---

### 🧱 Resource Models

#### 🧍 User

| Field       | Type    | Required | Description          |
| ----------- | ------- | -------- | -------------------- |
| `firstName` | String  | Yes      | First name           |
| `lastName`  | String  | Yes      | Last name            |
| `email`     | String  | Yes      | Must be unique       |
| `password`  | String  | Yes      | Minimum 6 characters |
| `isRegular` | Boolean | Yes      | Default: true        |
| `isAdmin`   | Boolean | Yes      | Default: false       |

#### ✅ Task

| Field         | Type    | Required | Description                                 |
| ------------- | ------- | -------- | ------------------------------------------- |
| `title`       | String  | Yes      | Brief title of the task                     |
| `description` | String  | No       | Details about the task                      |
| `dueDate`     | String  | No       | ISO date format                             |
| `status`      | String  | No       | Options: `TODO`, `IN_PROGRESS`, `COMPLETED` |
| `priority`    | String  | No       | Options: `LOW`, `MEDIUM`, `HIGH`            |
| `image`       | String  | No       | URL of the task image                       |
| `assigneeId`  | Integer | No       | ID of the user assigned to the task         |
| `creatorId`   | Integer | Yes      | ID of the user who created the task         |

---

### 🧪 CRUD Endpoints

#### 👤 Authentication Endpoints

- `POST /auth/register`: Register a new user whether admin or regular user
- `POST /auth/login`: Authenticate user and receive token

#### 📝 User Task Endpoints

- `POST /users/tasks/create`: Create a task
- `GET /users/tasks`: Get all tasks for logged-in user
- `GET /users/tasks/{taskId}`: Get a specific task
- `PUT /users/tasks/{taskId}/update`: Update a task
- `PUT /users/tasks/{taskId}/update-status`: Update a task status
- `DELETE /users/tasks/{taskId}/delete`: Delete a task
- `POST /users/tasks/{taskId}/assign`: Assign a task to another user

#### 🔐 Admin Endpoints

- `GET /admins/tasks`: View all users tasks
- `GET /admins/tasks/{taskId}`: View tasks for a specific user
- `DELETE /admins/tasks/{taskId}/delete`: Delete a user and their tasks
- `POST /admins/tasks/{taskId}/assign`: Assign a task to a user
- `GET /admins/users/{userId}/assign-tasks`: Get a task assigned to a user

---

### Endpoint Specifications

#### Create User

- URL: /api/v1/auth/register
- Method: POST
- Request Body:

```json
{
  "email": "user@example.com",
  "password": "@Password123",
  "firstName": "Ayomide",
  "lastName": "Adeyemi",
  "role": "ADMIN"
}
```

- Response:
  - 200 Created: Returns the created user.
  - 400 Bad Request: If validation fails.

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "Admin",
      "lastName": "Task",
      "email": "task.admin@gmail.com",
      "isRegular": false,
      "isAdmin": true,
      "updatedAt": "2025-04-05T20:37:21.946Z",
      "createdAt": "2025-04-05T20:37:21.946Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVHlwZSI6IlZFUklGWSIsImlhdCI6MTc0Mzg4NTQ0MSwiZXhwIjoxNzQzODg5MDQxfQ.XyeSKZ5pHnkfDsm1-POY28fWYu2Lv6UwaMV0zmcmATE"
  },
  "message": "Signup successful"
}
```

#### Create Task

```
Authorization: Bearer <token>
```

- URL: /api/v1/user/tasks/create
- Method: POST
- Request Body:

```json
{
  "title": "Task Title",
  "description": "Task Description",
  "dueDate": "2023-12-31",
  "priority": "LOW",
  "image": "image-file"
}
```

- Response:
  - 200 Created: Returns the created task.

```json
{
  "success": true,
  "data": {
    "task": {
      "status": "TODO",
      "id": 14,
      "title": "Backend Development",
      "description": "Create endpoint for Task Management System CRUD API'S",
      "priority": "HIGH",
      "dueDate": "2025-04-10T00:00:00.000Z",
      "creatorId": 4,
      "image": "image-1743901143059-Adeyemi_Ayomide_coding certification.jpg",
      "updatedAt": "2025-04-06T00:59:03.063Z",
      "createdAt": "2025-04-06T00:59:03.063Z"
    }
  },
  "message": "Task created successfully"
}
```

- 400 Bad Request: If validation fails.

```json
{
  "success": false,
  "message": "Due date cannot be in the past"
}
```

#### Get Task

```
Authorization: Bearer <token>
```

- URL: /api/v1/user/tasks/{taskId}
- Method: GET
- Response:
  - 200 OK: Returns the task details.

```json
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "assigneeId": 2,
      "creatorId": 3,
      "image": "image-1743885947033-Adeyemi_Ayomide_coding certification.jpg",
      "title": "Backend Development",
      "description": "Create endpoint for Task Management System CRUD API'S",
      "priority": "HIGH",
      "status": "TODO",
      "dueDate": "2025-04-10T00:00:00.000Z",
      "createdAt": "2025-04-05T20:45:47.000Z",
      "updatedAt": "2025-04-05T20:49:11.000Z",
      "deletedAt": null,
      "assignee": {
        "id": 2,
        "firstName": "Admin2",
        "lastName": "Task",
        "email": "task.admin2@gmail.com",
        "isRegular": false,
        "isAdmin": true,
        "createdAt": "2025-04-05T20:38:15.000Z",
        "updatedAt": "2025-04-05T20:38:15.000Z"
      }
    }
  }
}
```

- 404 Not Found: If the task ID is invalid.

```json
{
  "success": false,
  "message": "task not found"
}
```

---

### 🧪 CRUD Operations

#### User

- `POST /api/v1/auth/register`: Register a new user
- `POST /api/v1/auth/login`: Authenticate user and receive token

#### User Task

- `POST /api/v1/users/tasks/create`: Create a new task
- `GET /api/v1/users/tasks`: Get all tasks for logged-in user
- `GET /api/v1/users/tasks/{taskId}`: Get a specific task
- `PUT /api/v1/users/tasks/{taskId}/update`: Update a task
- `PUT /api/v1/users/tasks/{taskId}/update-status`: Update a task status
- `DELETE /api/v1/users/tasks/{taskId}/delete`: Delete a task
- `POST /api/v1/tasks/{taskId}/assign`: Assign a task to another user

#### Specialized Endpoints

- `GET /api/v1/tasks/users/{userId}/assign-tasks`: Get assigned tasks for a specific user
- `PATCH /api/v1/tasks/{taskId}/status`: Update task status

---

### 🔐 Authentication

- **JWT Tokens** are required in the `Authorization` header for both user and admin requests:

```
Authorization: Bearer <token>
```

#### Delete User

- URL: /api/v1/users/{userId}
- Method: DELETE
- Response:
  - 200 OK: Returns the deleted user.
  - 404 Not Found: If the user ID is invalid.

#### Create Task

- URL: /api/v1/tasks

Read Task: GET /api/v1/tasks/{taskId}

Update Task: PUT /api/v1/tasks/{taskId}

Delete Task: DELETE /api/v1/tasks/{taskId}

Specialized Endpoints
Get Tasks by User: GET /api/v1/users/{userId}/tasks
Update Task Status: PATCH /api/v1/tasks/{taskId}/status

## 🔐 Authentication

- **JWT Tokens** are required in the `Authorization` header for both user and admin requests:

```
Authorization: Bearer <token>
```

---

## 🧭 Example Use Case

| Role  | Action                            | Endpoint                                   |
| ----- | --------------------------------- | ------------------------------------------ |
| User  | Register                          | `POST /auth/register`                      |
| User  | Add Task                          | `POST /user/tasks/create`                  |
| Admin | View all tasks                    | `GET /admins/tasks`                        |
| Admin | Get all assigned tasks for a user | `GET /admins/tasks/users/:id/assign-tasks` |

---

## 🔗 Full Postman API Reference

For complete request examples and responses, visit the postman full docs:  
👉 [Postman Docs](https://documenter.getpostman.com/view/28637839/2sB2cUBi1F)

---

## Design Decisions

### Architecture

- The application follows a Model-View-Controller (MVC) architecture to separate concerns and improve maintainability.
- Sequelize ORM is used for database interactions, providing a simple and powerful way to manage database models.

### Database Design

- The database schema is designed to support tasks and users, allowing for easy expansion in the future.
- Relationships between tasks and users are established to maintain data integrity.

### API Design

- RESTful principles are followed to create a clean and intuitive API.
- JSON is used as the data interchange format for requests and responses.

### Security

- Environment variables are used to store sensitive information such as database credentials and secure keys.
- Input validation and sanitization are implemented to prevent SQL injection and other security vulnerabilities.

## Unit Tests

### Testing Framework

- The application uses Jest as the testing framework.

### Running Tests

To run the integration tests, execute the following command:

```bash
npm test
```

### Coverage

The tests case is in the **tests** directory.

- The tests has a public folders called `auth.controller.test.js`, `user.controller.test.js` and `leaderboard.controller.test.js`.
  The auth controller test is for testing the authentication endpoints.
  The user controller test is for testing the user endpoints.
  The leaderboard controller test is for testing the leaderboard endpoints.
- The user and admin test folders are for testing user tasks and for admin to manage user tasks.
  The tests cover core functionalities, including:
- Task creation, retrieval, updating, and deletion.
- Validation of input data.
- Error handling for invalid requests.

### Example Test Case

```test
const request = require("supertest");
const express = require("express");
const multer = require("multer");
const path = require("path");
const userTasksController = require("../src/controllers/user/tasks");
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

describe("Task API", () => {
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
});
```

### Business Rules & Constraints

## Validation & Business Logic

- A task's due_date must be in the future.
- A task can not be deleted when it is in progress.
- Tasks can be filtered by priority, due date and status.
- Tasks can be sorted by createdAt.

To filter tasks by priority, due date and status, use the following query parameters:

- `q[priority]`: Filter tasks by priority (LOW, MEDIUM, HIGH).
- `q[dueDate]`: Filter tasks by due date.
- `q[status]`: Filter tasks by status (TODO, IN_PROGRESS, COMPLETED).

To sort tasks by createdAt, use the following query parameters:

- `order[createdAt]`: Sort tasks by createdAt (ASC, DESC).

## Field Validation Rules

- String Fields:
  - firstName: max length 50.
  - lastName: max length 50.
  - email: must be a valid email format.
  - title: max length 255.
  - description: max length 1024.
  - image: max length 255.
- Enum Fields:
  - status: must be one of ["TODO", "IN_PROGRESS", "COMPLETED"].
  - priority: must be one of ["LOW", "MEDIUM", "HIGH"].

### Error Handling & Security

## Error Responses

- There are custom error classes and functions that are used to handle errors for reusability and consistency.
- There is appError, validationError, notFoundError, and apiResponse.

## Security

- JWT tokens are used for authentication and authorization.
- Role-based access control will be implemented for user actions.
- Sensitive data like password is encrypted and excluded from user response.

## Additional Considerations

- Empty List Behavior: Return an empty array if no tasks are found.
- Field Mutability: The status field is mutable only during specific transitions.
- Cross-Resource Validation: Ensure that the due_date of a task is after the current date.

## Conclusion

This README provides a comprehensive guide to setting up, using, and testing the Task Management System. By following the instructions and utilizing the API documentation, users can effectively manage their tasks and projects.

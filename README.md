# 📝 Task Management System

A web application that enables users and admins to efficiently create, manage, assign, and track tasks. This document includes setup instructions, API documentation, workflows, and design decisions.

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Setup Instructions](#setup-instructions)
5. [Environment Variables](#environment-variables)
6. [API Documentation](#api-documentation)
   - [Authentication](#authentication)
   - [User Workflows](#user-workflows)
   - [Admin Workflows](#admin-workflows)
7. [Data Models](#data-models)
8. [Example Use Cases](#example-use-cases)
9. [Postman Docs](#postman-docs)

---

## 🧭 Overview

The Task Management System is a role-based task tracker built with RESTful API principles. Users can manage their own tasks, while administrators have full oversight over users tasks.

---

## ✨ Features

- 👤 User Registration & Login (JWT)
- 📝 Task Creation, Assignment, Update, Deletion
- ✅ Task status updates (TODO, IN_PROGRESS, COMPLETED)
- 🔐 Role-based access control
- 📎 File/image upload for tasks
- 📊 Admin control over all tasks

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express
- **Database**: MySQL (via Sequelize ORM)
- **Auth**: JWT Token-based
- **Dev Tools**: Docker, Postman

---

## 🚀 Setup Instructions

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- Node.js (v14+)
- npm (Node Package Manager)

### Installation

1. **Clone the Repository**

```bash
git clone https://github.com/ayowilfred95/Task-Management-System.git
cd Task-Management-System
```

2. **Start MySQL Database with Docker**

```bash
docker compose up -d
```

This uses the `docker-compose.yml` in the root directory to spin up the MySQL container.

3. **Install Dependencies**

```bash
npm install
```

4. **Configure Environment Variables**

Create a `.env` file in the root directory and add the environment variables listed [here](#environment-variables).

5. **Run Migrations**

```bash
npx sequelize-cli db:migrate
```

6. **Run Tests (Optional)**

```bash
npm test
```

7. **Start the Server**

```bash
npm run start
```

Visit: `http://localhost:4000`

---

## ⚙️ Environment Variables

```env
APP_PORT=4000
APP_SECURE_KEY=taskmanagement123@#$%!!*&*&^$#etc
DB_USER=task-management
DB_PASS=task-management
DB_NAME=task-management
DB_HOST=localhost
DB_CHARSET=utf8mb4
DB_COLLATE=utf8mb4_unicode_ci
```

> You can adjust these based on your local or cloud database config.

---

## 📘 API Documentation

All endpoints are prefixed with:

```
http://localhost:4000/v1
```

---

### 🔐 Authentication

| Endpoint       | Method | Description             |
| -------------- | ------ | ----------------------- |
| /auth/register | POST   | Register new user/admin |
| /auth/login    | POST   | Login and get JWT token |

---

### 🔄 User Workflows

#### Task Endpoints

| Endpoint                       | Method | Description                 |
| ------------------------------ | ------ | --------------------------- |
| /users/tasks                   | GET    | Get all tasks for user      |
| /users/tasks/:id               | GET    | Get task by ID              |
| /users/tasks/create            | POST   | Create task                 |
| /users/tasks/:id/update        | PUT    | Update task                 |
| /users/tasks/:id/update-status | PUT    | Update task status          |
| /users/tasks/:id/delete        | DELETE | Delete task                 |
| /users/tasks/:id/assign        | POST   | Assign task to another user |

---

### 🛡️ Admin Workflows

| Endpoint                           | Method | Description                           |
| ---------------------------------- | ------ | ------------------------------------- |
| /admins/tasks                      | GET    | Get all tasks                         |
| /admins/tasks/:id                  | GET    | Get task by ID                        |
| /admins/tasks/:id/update           | PUT    | Update task                           |
| /admins/tasks/:id/delete           | DELETE | Delete task                           |
| /admins/tasks/:id/assign           | POST   | Assign task to user                   |
| /admins/users/:userId/assign-tasks | GET    | Get tasks assigned to a specific user |

> All routes require a valid JWT token passed as `Authorization: Bearer <token>`.

---

## 🧱 Data Models

### 🧍 User

| Field     | Type    | Required | Notes           |
| --------- | ------- | -------- | --------------- |
| firstName | String  | ✅       |                 |
| lastName  | String  | ✅       |                 |
| email     | String  | ✅       | Unique          |
| password  | String  | ✅       | >= 6 characters |
| isAdmin   | Boolean | ✅       | Default: false  |
| isRegular | Boolean | ✅       | Default: true   |

### ✅ Task

| Field       | Type    | Required | Notes                         |
| ----------- | ------- | -------- | ----------------------------- |
| title       | String  | ✅       |                               |
| description | String  | ✅       |                               |
| dueDate     | String  | ✅       | ISO format                    |
| status      | String  | ✅       | TODO, IN_PROGRESS, COMPLETED  |
| priority    | String  | ✅       | LOW, MEDIUM, HIGH             |
| image       | String  | ❌       | URL or filename               |
| assigneeId  | Integer | ✅       | ID of the assigned user       |
| creatorId   | Integer | ✅       | ID of the user who created it |

---

## 🔍 Example Use Cases

| Role  | Action                        | Endpoint                           |
| ----- | ----------------------------- | ---------------------------------- |
| User  | Register                      | POST /auth/register                |
| User  | Add Task                      | POST /users/tasks/create           |
| Admin | View all tasks                | GET /admins/tasks                  |
| Admin | Get assigned tasks for a user | GET /admins/users/:id/assign-tasks |

---

## 🔗 Postman Docs

A full collection with examples and responses is available here:  
👉 [View Postman Documentation](https://documenter.getpostman.com/view/28637839/2sB2cUBi1F)

---

## 🔐 Authentication

### **Register User/Admin**

**POST** `/auth/register`

#### 🔸 Request Body

```json
{
  "firstName": "Ayomide",
  "lastName": "Williams",
  "email": "task.admin1@gmail.com",
  "password": "@SecurePass123",
  "role": "ADMIN"
}
```

#### ✅ Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "Admin1",
      "lastName": "Task",
      "email": "task.admin1@gmail.com",
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

---

### **Login**

**POST** `/auth/login`

#### 🔸 Request Body

```json
{
  "email": "task.admin1@gmail.com",
  "password": "@SecurePass123"
}
```

#### ✅ Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "Admin1",
      "lastName": "Task",
      "email": "task.admin1@gmail.com",
      "isRegular": false,
      "isAdmin": true,
      "createdAt": "2025-04-05T20:37:21.000Z",
      "updatedAt": "2025-04-05T20:37:21.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInRva2VuVHlwZSI6IkFDQ0VTUyIsImlhdCI6MTc0MzkwMjU0NCwiZXhwIjoxNzQzOTg4OTQ0fQ.txpp4tM2iX27fKAoGxbNgvl3ii5usWr9AjPbGJs_kDY"
  },
  "message": "Login successfull"
}
```

---

## 🧍 User Endpoints

### **Create Task**

**POST** `/users/tasks`

#### 🔸 Request (with file upload using `form-data`)

```
title: "Write Report"
description: "Write the weekly performance report"
priority: "HIGH"
dueDate: "2025-04-10"
image: [file upload]
```

#### ✅ Response

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

---

### **Update Task Status**

**PUT** `/users/tasks/:id/update-status`

#### 🔸 Request Body

```json
{
  "status": "IN_PROGRESS"
}
```

#### ✅ Response

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
      "status": "IN_PROGRESS",
      "dueDate": "2025-04-10T00:00:00.000Z",
      "createdAt": "2025-04-05T20:45:47.000Z",
      "updatedAt": "2025-04-05T20:51:27.000Z",
      "deletedAt": null
    }
  }
}
```

---

### **Assign Task to Another User**

**POST** `/users/tasks/:id/assign`

#### 🔸 Request Body

```json
{
  "assigneeId": 4
}
```

#### ✅ Response

```json
{
  "success": true,
  "data": {
    "task": {
      "id": 14,
      "assigneeId": 4,
      "creatorId": 5,
      "image": "image-1743901143059-Adeyemi_Ayomide_coding certification.jpg",
      "title": "Backend Development",
      "description": "Create endpoint for Task Management System CRUD API'S",
      "priority": "HIGH",
      "status": "TODO",
      "dueDate": "2025-04-10T00:00:00.000Z",
      "createdAt": "2025-04-06T00:59:03.000Z",
      "updatedAt": "2025-04-06T01:10:38.000Z",
      "deletedAt": null
    },
    "message": "Email notification sent successfully to User3 Task"
  }
}
```

---

### **Get Assigned Tasks**

**GET** `/users/tasks/assign-tasks`

#### 🔸 Query Parameters

```js
{
  "page": 1,
  "limit": 10
}
```

#### ✅ Response

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 1,
        "assigneeId": 4,
        "creatorId": 3,
        "image": "image-1743886442669-Adeyemi_Ayomide_aws cloud certification.jpg",
        "title": "Backend Development",
        "description": "Create endpoint for Task Management System CRUD API'S",
        "priority": "LOW",
        "status": "IN_PROGRESS",
        "dueDate": "2025-04-12T00:00:00.000Z",
        "createdAt": "2025-04-05T20:45:47.000Z",
        "updatedAt": "2025-04-06T00:02:12.000Z",
        "deletedAt": null,
        "creator": {
          "id": 3,
          "firstName": "User1",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        }
      }
    ],
    "pagination": {
      "limit": 10,
      "page": 1,
      "pages": 1,
      "rows": 1
    }
  }
}
```

---

### **Get all tasks

**GET** `/users/tasks`

#### 🔸 Query Parameters

```js
{
  "q[status]": "TODO",
  "q[priority]": "HIGH",
  "q[dueDate]": "2025-04-10",
  "order[createdAt]": "DESC",
  "page": 1,
  "limit": 10
}
```

#### ✅ Response

````json
{
    "success": true,
    "data": {
        "tasks": [
            {
                "id": 14,
                "assigneeId": 5,
                "creatorId": 4,
                "image": "image-1743901143059-Adeyemi_Ayomide_coding certification.jpg",
                "title": "Backend Development",
                "description": "Create endpoint for Task Management System CRUD API'S",
                "priority": "HIGH",
                "status": "COMPLETED",
                "dueDate": "2025-04-10T00:00:00.000Z",
                "createdAt": "2025-04-06T00:59:03.000Z",
                "updatedAt": "2025-04-06T01:11:45.000Z",
                "deletedAt": null,
                "assignee": {
                    "id": 5,
                    "firstName": "User3",
                    "lastName": "Task",
                    "isAdmin": false,
                    "isRegular": true
                }
            },
            {
                "id": 13,
                "assigneeId": 5,
                "creatorId": 4,
                "image": "image-1743901141646-Adeyemi_Ayomide_coding certification.jpg",
                "title": "Backend Development",
                "description": "Create endpoint for Task Management System CRUD API'S",
                "priority": "HIGH",
                "status": "COMPLETED",
                "dueDate": "2025-04-10T00:00:00.000Z",
                "createdAt": "2025-04-06T00:59:01.000Z",
                "updatedAt": "2025-04-06T01:11:41.000Z",
                "deletedAt": null,
                "assignee": {
                    "id": 5,
                    "firstName": "User3",
                    "lastName": "Task",
                    "isAdmin": false,
                    "isRegular": true
                }
            },
            {
                "id": 12,
                "assigneeId": 5,
                "creatorId": 4,
                "image": "image-1743901140328-Adeyemi_Ayomide_coding certification.jpg",
                "title": "Backend Development",
                "description": "Create endpoint for Task Management System CRUD API'S",
                "priority": "HIGH",
                "status": "COMPLETED",
                "dueDate": "2025-04-10T00:00:00.000Z",
                "createdAt": "2025-04-06T00:59:00.000Z",
                "updatedAt": "2025-04-06T01:11:37.000Z",
                "deletedAt": null,
                "assignee": {
                    "id": 5,
                    "firstName": "User3",
                    "lastName": "Task",
                    "isAdmin": false,
                    "isRegular": true
                }
            },
            {
                "id": 11,
                "assigneeId": 5,
                "creatorId": 4,
                "image": "image-1743901138720-Adeyemi_Ayomide_coding certification.jpg",
                "title": "Backend Development",
                "description": "Create endpoint for Task Management System CRUD API'S",
                "priority": "HIGH",
                "status": "COMPLETED",
                "dueDate": "2025-04-10T00:00:00.000Z",
                "createdAt": "2025-04-06T00:58:58.000Z",
                "updatedAt": "2025-04-06T01:11:32.000Z",
                "deletedAt": null,
                "assignee": {
                    "id": 5,
                    "firstName": "User3",
                    "lastName": "Task",
                    "isAdmin": false,
                    "isRegular": true
                }
            }
        ],
        "pagination": {
            "limit": 10,
            "page": 1,
            "pages": 1,
            "rows": 4
        }
    }
}
````
---

### **Delete Task**
**DELETE** `/users/tasks/:/delete`

#### 🔸 Request
```js
{
  "id": 14
}
````

#### ✅ Response

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## 🛡️ Admin Endpoints

### **Get All Tasks**

**GET** `/admins/tasks`

#### 🔸 Query Parameters

```js
{
  "q[status]": "TODO",
  "q[priority]": "HIGH",
  "q[dueDate]": "2025-04-10",
  "order[createdAt]": "DESC",
  "page": 1,
  "limit": 10
}
```

#### ✅ Response

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 14,
        "assigneeId": 5,
        "creatorId": 4,
        "image": "image-1743901143059-Adeyemi_Ayomide_coding certification.jpg",
        "title": "Backend Development",
        "description": "Create endpoint for Task Management System CRUD API'S",
        "priority": "HIGH",
        "status": "COMPLETED",
        "dueDate": "2025-04-10T00:00:00.000Z",
        "createdAt": "2025-04-06T00:59:03.000Z",
        "updatedAt": "2025-04-06T01:11:45.000Z",
        "deletedAt": null,
        "creator": {
          "id": 4,
          "firstName": "User2",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        },
        "assignee": {
          "id": 5,
          "firstName": "User3",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        }
      },
      {
        "id": 13,
        "assigneeId": 5,
        "creatorId": 4,
        "image": "image-1743901141646-Adeyemi_Ayomide_coding certification.jpg",
        "title": "Backend Development",
        "description": "Create endpoint for Task Management System CRUD API'S",
        "priority": "HIGH",
        "status": "COMPLETED",
        "dueDate": "2025-04-10T00:00:00.000Z",
        "createdAt": "2025-04-06T00:59:01.000Z",
        "updatedAt": "2025-04-06T01:11:41.000Z",
        "deletedAt": null,
        "creator": {
          "id": 4,
          "firstName": "User2",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        },
        "assignee": {
          "id": 5,
          "firstName": "User3",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        }
      },
      {
        "id": 12,
        "assigneeId": 5,
        "creatorId": 4,
        "image": "image-1743901140328-Adeyemi_Ayomide_coding certification.jpg",
        "title": "Backend Development",
        "description": "Create endpoint for Task Management System CRUD API'S",
        "priority": "HIGH",
        "status": "COMPLETED",
        "dueDate": "2025-04-10T00:00:00.000Z",
        "createdAt": "2025-04-06T00:59:00.000Z",
        "updatedAt": "2025-04-06T01:11:37.000Z",
        "deletedAt": null,
        "creator": {
          "id": 4,
          "firstName": "User2",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        },
        "assignee": {
          "id": 5,
          "firstName": "User3",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        }
      },
      {
        "id": 11,
        "assigneeId": 5,
        "creatorId": 4,
        "image": "image-1743901138720-Adeyemi_Ayomide_coding certification.jpg",
        "title": "Backend Development",
        "description": "Create endpoint for Task Management System CRUD API'S",
        "priority": "HIGH",
        "status": "COMPLETED",
        "dueDate": "2025-04-10T00:00:00.000Z",
        "createdAt": "2025-04-06T00:58:58.000Z",
        "updatedAt": "2025-04-06T01:11:32.000Z",
        "deletedAt": null,
        "creator": {
          "id": 4,
          "firstName": "User2",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        },
        "assignee": {
          "id": 5,
          "firstName": "User3",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        }
      },
      {
        "id": 10,
        "assigneeId": null,
        "creatorId": 3,
        "image": "image-1743886498875-Adeyemi_Ayomide_coding certification.jpg",
        "title": "Backend Development",
        "description": "Create endpoint for Task Management System CRUD API'S",
        "priority": "HIGH",
        "status": "TODO",
        "dueDate": "2025-04-10T00:00:00.000Z",
        "createdAt": "2025-04-05T20:54:58.000Z",
        "updatedAt": "2025-04-05T20:54:58.000Z",
        "deletedAt": null,
        "creator": {
          "id": 3,
          "firstName": "User1",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        },
        "assignee": null
      },
      {
        "id": 9,
        "assigneeId": null,
        "creatorId": 3,
        "image": "image-1743886497793-Adeyemi_Ayomide_coding certification.jpg",
        "title": "Backend Development",
        "description": "Create endpoint for Task Management System CRUD API'S",
        "priority": "HIGH",
        "status": "TODO",
        "dueDate": "2025-04-10T00:00:00.000Z",
        "createdAt": "2025-04-05T20:54:57.000Z",
        "updatedAt": "2025-04-05T20:54:57.000Z",
        "deletedAt": null,
        "creator": {
          "id": 3,
          "firstName": "User1",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        },
        "assignee": null
      },
      {
        "id": 6,
        "assigneeId": null,
        "creatorId": 3,
        "image": "image-1743886493397-Adeyemi_Ayomide_coding certification.jpg",
        "title": "Backend Development",
        "description": "Create endpoint for Task Management System CRUD API'S",
        "priority": "HIGH",
        "status": "COMPLETED",
        "dueDate": "2025-04-10T00:00:00.000Z",
        "createdAt": "2025-04-05T20:54:53.000Z",
        "updatedAt": "2025-04-06T01:32:18.000Z",
        "deletedAt": null,
        "creator": {
          "id": 3,
          "firstName": "User1",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        },
        "assignee": null
      },
      {
        "id": 5,
        "assigneeId": 7,
        "creatorId": 3,
        "image": "image-1743886492477-Adeyemi_Ayomide_coding certification.jpg",
        "title": "Backend Development",
        "description": "Create endpoint for Task Management System CRUD API'S",
        "priority": "HIGH",
        "status": "COMPLETED",
        "dueDate": "2025-04-10T00:00:00.000Z",
        "createdAt": "2025-04-05T20:54:52.000Z",
        "updatedAt": "2025-04-06T01:32:05.000Z",
        "deletedAt": null,
        "creator": {
          "id": 3,
          "firstName": "User1",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        },
        "assignee": {
          "id": 7,
          "firstName": "User5",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        }
      },
      {
        "id": 4,
        "assigneeId": 8,
        "creatorId": 3,
        "image": "image-1743886491565-Adeyemi_Ayomide_coding certification.jpg",
        "title": "Backend Development",
        "description": "Create endpoint for Task Management System CRUD API'S",
        "priority": "HIGH",
        "status": "COMPLETED",
        "dueDate": "2025-04-10T00:00:00.000Z",
        "createdAt": "2025-04-05T20:54:51.000Z",
        "updatedAt": "2025-04-06T01:32:00.000Z",
        "deletedAt": null,
        "creator": {
          "id": 3,
          "firstName": "User1",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        },
        "assignee": {
          "id": 8,
          "firstName": "User6",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        }
      },
      {
        "id": 3,
        "assigneeId": 8,
        "creatorId": 3,
        "image": "image-1743886490641-Adeyemi_Ayomide_coding certification.jpg",
        "title": "Backend Development",
        "description": "Create endpoint for Task Management System CRUD API'S",
        "priority": "HIGH",
        "status": "COMPLETED",
        "dueDate": "2025-04-10T00:00:00.000Z",
        "createdAt": "2025-04-05T20:54:50.000Z",
        "updatedAt": "2025-04-06T01:31:56.000Z",
        "deletedAt": null,
        "creator": {
          "id": 3,
          "firstName": "User1",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        },
        "assignee": {
          "id": 8,
          "firstName": "User6",
          "lastName": "Task",
          "isAdmin": false,
          "isRegular": true
        }
      }
    ],
    "pagination": {
      "limit": 10,
      "page": 1,
      "pages": 2,
      "rows": 12
    }
  }
}
```

---

### **Assign Task**

**POST** `/admins/tasks/:id/assign`

#### 🔸 Request Body

```json
{
  "assigneeId": 4
}
```

#### ✅ Response

```json
{
  "success": true,
  "data": {
    "task": {
      "id": 2,
      "assigneeId": 4,
      "creatorId": 3,
      "image": "image-1743886489393-Adeyemi_Ayomide_coding certification.jpg",
      "title": "Backend Development",
      "description": "Create endpoint for Task Management System CRUD API'S",
      "priority": "HIGH",
      "status": "TODO",
      "dueDate": "2025-04-10T00:00:00.000Z",
      "createdAt": "2025-04-05T20:54:49.000Z",
      "updatedAt": "2025-04-06T01:31:14.000Z",
      "deletedAt": null
    },
    "message": "Email notification sent successfully to User6 Task"
  }
}
```

---

### **Get Ranking Summary**

**GET** `/rank-summary`

#### 🔸 Query Parameters

```js
{
  "page": 1,
  "limit": 10
}
```

#### ✅ Response

```json
{
  "success": true,
  "data": {
    "completedTasksByCreator": [
      {
        "firstName": "User2",
        "lastName": "Task",
        "completedTasks": 5,
        "totalTasks": 5,
        "completionRate": "100",
        "rank": 1
      },
      {
        "firstName": "User3",
        "lastName": "Task",
        "completedTasks": 4,
        "totalTasks": 4,
        "completionRate": "100",
        "rank": 2
      },
      {
        "firstName": "User6",
        "lastName": "Task",
        "completedTasks": 3,
        "totalTasks": 3,
        "completionRate": "100",
        "rank": 3
      },
      {
        "firstName": "User5",
        "lastName": "Task",
        "completedTasks": 1,
        "totalTasks": 1,
        "completionRate": "100",
        "rank": 4
      },
      {
        "firstName": "User1",
        "lastName": "Task",
        "completedTasks": 6,
        "totalTasks": 7,
        "completionRate": "85.71",
        "rank": 5
      },
      {
        "firstName": "Admin1",
        "lastName": "Task",
        "completedTasks": 0,
        "totalTasks": 0,
        "completionRate": "0",
        "rank": 6
      },
      {
        "firstName": "Admin2",
        "lastName": "Task",
        "completedTasks": 0,
        "totalTasks": 0,
        "completionRate": "0",
        "rank": 6
      },
      {
        "firstName": "User4",
        "lastName": "Task",
        "completedTasks": 0,
        "totalTasks": 0,
        "completionRate": "0",
        "rank": 6
      }
    ],
    "pagination": {
      "total": 8,
      "pages": 1,
      "page": 1,
      "rows": 8
    }
  }
}
```

---

## Design Decisions

### Architecture

- The application follows a Model-View-Controller (MVC) architecture to separate concerns and improve maintainability.
- Sequelize ORM is used for database interactions, providing a simple and powerful way to manage database models by using classes to extend the data access object (DAO) pattern.

### Database Design

- The database schema is designed to support tasks and users, allowing for easy expansion in the future.
- Relationships between tasks and users are established to maintain data integrity.

### API Design

- RESTful principles are followed to create a clean and intuitive API.
- JSON is used as the data interchange format for requests and responses.

### Security

- Environment variables are used to store sensitive information such as database credentials and secure keys.
- Input validation and sanitization are implemented to prevent SQL injection and other security vulnerabilities.

## Integration Tests

### Testing Framework

- The application uses Jest as the testing framework.

### Running Tests

To run the integration tests, execute the following command:

bash
npm test

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

```js
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

// Fix: Ensure joi is required inside the mock function
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

- q[priority]: Filter tasks by priority (LOW, MEDIUM, HIGH).
- q[dueDate]: Filter tasks by due date.
- q[status]: Filter tasks by status (TODO, IN_PROGRESS, COMPLETED).

To sort tasks by createdAt, use the following query parameters:

- order[createdAt]: Sort tasks by createdAt (ASC, DESC).

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

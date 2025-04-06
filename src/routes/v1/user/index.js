const express = require("express");
const TaskRoutes = require("./task.routes")

const router = express.Router();
router.use("/tasks", TaskRoutes);

module.exports = router;

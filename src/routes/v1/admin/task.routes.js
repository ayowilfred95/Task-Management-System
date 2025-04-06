const express = require('express');
const AdminController = require('../../../controllers/admin/tasks');
const {MulterService} = require("../../../services")

const router = express.Router();


router.get("/", AdminController.getAll);
// router.post("/create", AdminController.create);
router.put("/:id([0-9]+)/update", MulterService.upload.single("image"), AdminController.update);
router.put("/:id([0-9]+)/update-status", AdminController.updateStatus);
router.delete("/:id([0-9]+)/delete", AdminController.delete);
router.get("/:id([0-9]+)", AdminController.getOne);
router.post("/:id([0-9]+)/assign", AdminController.assign);
router.get("/users/:id([0-9]+)/assign-tasks", AdminController.getAssignTasksToUser);


module.exports = router;



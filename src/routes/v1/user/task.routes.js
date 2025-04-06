const express = require('express');
const UserController = require('../../../controllers/user/tasks');
const {MulterService} = require("../../../services")

const router = express.Router();


router.get("/", UserController.getAll);
router.post("/create", MulterService.upload.single("image"), UserController.create);
router.get("/assign-tasks", UserController.getAssignTasks);
router.put("/:id([0-9]+)/update", MulterService.upload.single("image"), UserController.update);
router.put("/:id([0-9]+)/update-status", UserController.updateStatus);
router.delete("/:id([0-9]+)/delete", UserController.delete);
router.get("/:id([0-9]+)", UserController.getOne);
router.post("/:id([0-9]+)/assign", UserController.assign);



module.exports = router;
  
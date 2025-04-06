const express = require("express");
const AuthRoutes = require("./auth.routes")
const UserRoutes = require("./user")
const AdminRoutes = require("./admin")
const LeaderboardRoutes = require("./leaderboard.routes")








//middlewares
const { authGuard } = require("../../middlewares/authGuards")
const { adminGuard } = require("../../middlewares/roleGuards")

const router = express.Router();

// public routes
router.use("/auth", AuthRoutes);
router.use("/leaderboard", LeaderboardRoutes);



// guarded routes
router.use("/user", authGuard, UserRoutes);
router.use("/admin", [authGuard, adminGuard], AdminRoutes);

module.exports = router;
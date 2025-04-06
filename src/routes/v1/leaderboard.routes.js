const express = require('express');
const leaderboardController = require('../../controllers/leaderboard.js');

const router = express.Router();
router.get("/rank-summary", leaderboardController.rankSummary);

module.exports = router;
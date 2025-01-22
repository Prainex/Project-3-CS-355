var express = require('express');
var router = express.Router();
const fs = require("fs");
const path = require("path");

// Path to the userDB.json file
const userDBFileName = "./model/userDB.json";

// Function to read the user database
function readUserDB() {
    let data = fs.readFileSync(userDBFileName, "utf-8");
    return JSON.parse(data);
}

// Leaderboard route
router.get('/', (req, res) => {
    try {
        // Read and sort the users by highest_score in descending order
        const users = readUserDB();
        const sortedUsers = users.sort((a, b) => b.highest_score - a.highest_score);

        // Render the leaderboard page with sorted data
        res.render('leaderboard', { leaderboard: sortedUsers });
    } catch (err) {
        console.error("Error reading user database:", err);
        res.render('leaderboard', { leaderboard: [], errorMessage: "Failed to load leaderboard data." });
    }
});

module.exports = router;

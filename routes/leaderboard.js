var express = require('express');
var router = express.Router();
const { getCollection } = require('../model/db'); // Assuming this function connects to MongoDB and retrieves collections

// Leaderboard route
router.get('/', async (req, res) => {
    try {
        // Get the 'users' collection from MongoDB
        const userCollection = getCollection('users');
        
        // Query all users, sort by highest_score in descending order, and convert to an array
        const sortedUsers = await userCollection
            .find({})
            .sort({ highestScore: -1 })
            .toArray();

        // Render the leaderboard view with the sorted users
        res.render('leaderboard', { leaderboard: sortedUsers });
    } catch (err) {
        console.error("Error retrieving user data from MongoDB:", err);

        // Render the leaderboard view with an empty list and an error message
        res.render('leaderboard', { leaderboard: [], errorMessage: "Failed to load leaderboard data." });
    }
});

module.exports = router;

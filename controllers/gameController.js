// Imports axios so the server can call an external API.
import axios from "axios";

// Imports the Run model for saving and reading game run data.
import Run from "../models/Run.js";

// Imports mongoose to create ObjectId values for database queries.
import mongoose from "mongoose";

// Gets a new heart puzzle from the external puzzle API.
// This is used for the revive popup in the game.
export async function getNewHeart(req, res) {
  try {
    // External API that returns a puzzle in JSON format.
    const url = "https://marcconrad.com/uob/heart/api.php?out=json&base64=no";

    // Requests a new puzzle from the external service.
    const response = await axios.get(url);

    // Sends the puzzle data back to the frontend.
    res.json(response.data);
  } catch {
    // Sends an error response if the puzzle request fails.
    res.status(500).json({ message: "Failed to fetch puzzle" });
  }
}

// Saves one completed game run to the database.
export async function submitRun(req, res) {
  try {
    // Gets score and difficulty from the request body.
    const { score, difficulty } = req.body;

    // Validates the incoming run data.
    if (typeof score !== "number" || !difficulty) {
      return res.status(400).json({ message: "Invalid run data" });
    }

    // Creates and stores a new run using the logged-in user's details.
    const run = await Run.create({
      userId: req.user.userId || req.user.id || req.user._id,
      userName: req.user.userName,
      userImage: req.user.image,
      score,
      difficulty,
    });

    // Sends success response with the saved run.
    res.status(201).json({ message: "Run saved", run });
  } catch {
    // Sends an error response if saving fails.
    res.status(500).json({ message: "Failed to save run" });
  }
}

// Returns the current user's recent game runs.
// This is used for the Progress Log page.
export async function myRuns(req, res) {
  try {
    // Finds runs belonging to the logged-in user,
    // sorted from newest to oldest, limited to 100 results.
    const runs = await Run.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .select("score difficulty createdAt userName userImage");

    // Sends the run list back to the frontend.
    res.json({ runs });
  } catch {
    // Sends an error response if loading runs fails.
    res.status(500).json({ message: "Failed to load runs" });
  }
}

// Returns the leaderboard using the best score from each user.
// Only the top 10 players are included.
export async function leaderboard(req, res) {
  try {
    const top = await Run.aggregate([
      // Sorts runs so the best score for each user appears first.
      { $sort: { score: -1, createdAt: -1 } },

      // Groups runs by user and keeps only that user's best run.
      {
        $group: {
          _id: "$userId",
          userId: { $first: "$userId" },
          userName: { $first: "$userName" },
          userImage: { $first: "$userImage" },
          bestScore: { $first: "$score" },
          bestDifficulty: { $first: "$difficulty" },
          bestAt: { $first: "$createdAt" },
        },
      },

      // Sorts the final leaderboard by best score.
      { $sort: { bestScore: -1, bestAt: 1 } },

      // Limits the result to the top 10 users.
      { $limit: 10 },
    ]);

    // Sends leaderboard data back to the frontend.
    res.json({ top });
  } catch (e) {
    // Sends an error response if leaderboard loading fails.
    res.status(500).json({ message: "Failed to load leaderboard" });
  }
}

// Returns run statistics for the current user grouped by difficulty.
// This is used on the player profile page.
export async function profileStats(req, res) {
  try {
    // Gets the logged-in user's id from the auth data.
    const uid = req.user.userId || req.user.id || req.user._id;

    // Groups the user's runs by difficulty and calculates total runs and best score.
    const rows = await Run.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(uid) } },
      {
        $group: {
          _id: "$difficulty",
          runs: { $sum: 1 },
          bestScore: { $max: "$score" },
        },
      },
    ]);

    // Creates a default result object for all difficulty levels.
    const stats = {
      easy: { runs: 0, bestScore: 0 },
      medium: { runs: 0, bestScore: 0 },
      hard: { runs: 0, bestScore: 0 },
    };

    // Fills the stats object with real values from the database result.
    for (const r of rows) {
      if (!stats[r._id]) continue;
      stats[r._id].runs = r.runs || 0;
      stats[r._id].bestScore = r.bestScore || 0;
    }

    // Sends the final difficulty stats back to the frontend.
    res.json({ stats });
  } catch (e) {
    // Sends an error response if stats loading fails.
    res.status(500).json({ message: "Failed to load stats" });
  }
}
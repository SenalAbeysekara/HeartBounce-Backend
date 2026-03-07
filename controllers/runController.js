import axios from "axios";
import Run from "../models/Run.js";
import mongoose from "mongoose";

// Fetches a new heart puzzle from the external API
export async function getNewHeart(req, res) {
  try {
    const url = "https://marcconrad.com/uob/heart/api.php?out=json&base64=no";
    const response = await axios.get(url);
    res.json(response.data);
  } catch {
    res.status(500).json({ message: "Failed to fetch puzzle" });
  }
}

// Saves a completed run for the logged-in user
export async function submitRun(req, res) {
  try {
    const { score, difficulty } = req.body;

    if (typeof score !== "number" || !difficulty) {
      return res.status(400).json({ message: "Invalid run data" });
    }

    const run = await Run.create({
      userId: req.user.userId || req.user.id || req.user._id,
      userName: req.user.userName,
      userImage: req.user.image,
      score,
      difficulty,
    });

    res.status(201).json({ message: "Run saved", run });
  } catch {
    res.status(500).json({ message: "Failed to save run" });
  }
}

// Returns the current user's recent runs
export async function myRuns(req, res) {
  try {
    const runs = await Run.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .select("score difficulty createdAt userName userImage");

    res.json({ runs });
  } catch {
    res.status(500).json({ message: "Failed to load runs" });
  }
}

// Builds leaderboard using each user's best score
export async function leaderboard(req, res) {
  try {
    const top = await Run.aggregate([
      { $sort: { score: -1, createdAt: -1 } },
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
      { $sort: { bestScore: -1, bestAt: 1 } },
      { $limit: 10 },
    ]);

    res.json({ top });
  } catch (e) {
    res.status(500).json({ message: "Failed to load leaderboard" });
  }
}

// Returns run stats grouped by difficulty for the current user
export async function profileStats(req, res) {
  try {
    const uid = req.user.userId || req.user.id || req.user._id;

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

    const stats = {
      easy: { runs: 0, bestScore: 0 },
      medium: { runs: 0, bestScore: 0 },
      hard: { runs: 0, bestScore: 0 },
    };

    for (const r of rows) {
      if (!stats[r._id]) continue;
      stats[r._id].runs = r.runs || 0;
      stats[r._id].bestScore = r.bestScore || 0;
    }

    res.json({ stats });
  } catch (e) {
    res.status(500).json({ message: "Failed to load stats" });
  }
}
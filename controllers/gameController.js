import axios from "axios";
import Run from "../models/Run.js";
import mongoose from "mongoose";

// Heart API proxy (revive popup)
export async function getNewHeart(req, res) {
  try {
    const url = "https://marcconrad.com/uob/heart/api.php?out=json&base64=no";
    const response = await axios.get(url);
    res.json(response.data);
  } catch {
    res.status(500).json({ message: "Failed to fetch puzzle" });
  }
}

// ✅ Save run (NO result now)
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

// Progress Log: current user's runs
export async function myRuns(req, res) {
  try {
    const runs = await Run.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .select("score difficulty createdAt userName userImage"); // ✅ no result

    res.json({ runs });
  } catch {
    res.status(500).json({ message: "Failed to load runs" });
  }
}

// ✅ Leaderboard: ONE BEST score per user (top 10)
export async function leaderboard(req, res) {
  try {
    const top = await Run.aggregate([
      // get the best run per user (score desc, then latest)
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

// Profile stats by difficulty (runner game) - NO win/lose
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
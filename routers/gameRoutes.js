// Imports Express so we can create a router for game-related routes.
import express from "express";

// Imports the authentication middleware to protect private routes.
import { authenticate } from "../middlewares/auth.js";

// Imports all controller functions used by these game routes.
import {
  getNewHeart,
  submitRun,
  myRuns,
  leaderboard,
  profileStats,
} from "../controllers/gameController.js";

// Creates a new Express router for game features.
const router = express.Router();

// Returns a new revive puzzle for the logged-in user.
router.get("/heart/new", authenticate, getNewHeart);

// Saves a completed game run for the logged-in user.
router.post("/runs", authenticate, submitRun);

// Returns the logged-in user's saved game runs.
router.get("/runs/me", authenticate, myRuns);

// Returns the public leaderboard.
router.get("/leaderboard", leaderboard);

// Returns the logged-in user's profile stats by difficulty.
router.get("/profile-stats", authenticate, profileStats);

// Exports this router so it can be used in the main server file.
export default router;
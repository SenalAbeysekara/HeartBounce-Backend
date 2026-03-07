import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  getNewHeart,
  submitRun,
  myRuns,
  leaderboard,
  profileStats,
} from "../controllers/runController.js";

const router = express.Router();

// Public route
router.get("/leaderboard", leaderboard);

// Everything below this line requires auth
router.use(authenticate);

router.get("/heart/new", getNewHeart);
router.post("/runs", submitRun);
router.get("/runs/me", myRuns);
router.get("/profile-stats", profileStats);

export default router;
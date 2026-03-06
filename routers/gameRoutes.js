import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  getNewHeart,
  submitRun,
  myRuns,
  leaderboard,
  profileStats,
} from "../controllers/gameController.js";

const router = express.Router();

router.get("/heart/new", authenticate, getNewHeart);
router.post("/runs", authenticate, submitRun);
router.get("/runs/me", authenticate, myRuns);
router.get("/leaderboard", leaderboard);
router.get("/profile-stats", authenticate, profileStats);

export default router;
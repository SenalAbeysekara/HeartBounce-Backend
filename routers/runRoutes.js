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

router.use(authenticate);

router.get("/heart/new", getNewHeart);
router.post("/runs", submitRun);
router.get("/runs/me", myRuns);
router.get("/leaderboard", leaderboard);
router.get("/profile-stats", profileStats);

export default router;
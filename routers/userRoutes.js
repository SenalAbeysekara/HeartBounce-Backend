import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  register,
  login,
  resetPassword,
  me,
  logout,
  updateUserName,
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword);

// Everything below requires auth
router.use(authenticate);

router.post("/logout", logout);
router.get("/me", me);
router.put("/username", updateUserName);

export default router;
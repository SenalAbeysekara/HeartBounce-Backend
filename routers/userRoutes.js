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

// public
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/reset-password", resetPassword);

// protected
router.get("/me", authenticate, me);
router.put("/username", authenticate, updateUserName);

export default router;
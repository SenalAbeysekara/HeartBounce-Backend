// Imports Express so we can create routes for user-related actions.
import express from "express";

// Imports the authentication middleware to protect private routes.
import { authenticate } from "../middlewares/auth.js";

// Imports all controller functions used in these user routes.
import {
  register,
  login,
  resetPassword,
  me,
  logout,
  updateUserName,
} from "../controllers/userController.js";

// Creates a new Express router for user features.
const router = express.Router();

// Public routes that can be used without logging in.
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/reset-password", resetPassword);

// Protected routes that require a valid logged-in user.
router.get("/me", authenticate, me);
router.put("/username", authenticate, updateUserName);

// Exports this router so it can be connected in the main server file.
export default router;
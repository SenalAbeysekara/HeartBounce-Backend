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

router.post("/register", register);
router.post("/login", login);

router.use(authenticate);

router.post("/logout", logout);
router.get("/me", me);
router.put("/username", updateUserName);
router.post("/reset-password", resetPassword);

export default router;
import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { me, logout, updateUserName } from "../controllers/authController.js";

const router = express.Router();

router.get("/me", authenticate, me);
router.post("/logout", logout);
router.put("/username", authenticate, updateUserName);

export default router;
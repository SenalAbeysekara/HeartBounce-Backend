import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import userRoutes from "./routers/userRoutes.js";
import authRoutes from "./routers/authRoutes.js";
import gameRoutes from "./routers/gameRoutes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

app.get("/", (req, res) => res.send("API running"));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(3000, () => console.log("Server running on 3000"));
  })
  .catch((err) => console.log("MongoDB connection failed:", err.message));
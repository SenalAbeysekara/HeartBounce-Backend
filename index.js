import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import userRoutes from "./routers/userRoutes.js";
import runRoutes from "./routers/runRoutes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// Allows frontend requests and cookies
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

app.get("/", (req, res) => res.send("API running"));

app.use("/api/users", userRoutes);
app.use("/api/run", runRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(3000, () => console.log("Server running on 3000"));
  })
  .catch((err) => console.log("MongoDB connection failed:", err.message));
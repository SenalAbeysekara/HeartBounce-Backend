// Imports Express to create the backend server.
import express from "express";

// Imports mongoose to connect the app with MongoDB.
import mongoose from "mongoose";

// Imports cors so the frontend can communicate with the backend safely.
import cors from "cors";

// Loads environment variables from the .env file.
import "dotenv/config";

// Imports cookie-parser so the server can read cookies from requests.
import cookieParser from "cookie-parser";

// Imports all user-related routes.
import userRoutes from "./routers/userRoutes.js";

// Imports all game-related routes.
import gameRoutes from "./routers/gameRoutes.js";

// Creates the Express application.
const app = express();

// Allows the server to read JSON data sent in requests.
app.use(express.json());

// Allows the server to read cookies from the browser.
app.use(cookieParser());

// Enables CORS so the frontend app can call this backend.
// It also allows cookies to be sent with requests.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// Simple test route to confirm the API is running.
app.get("/", (req, res) => res.send("API running"));

// Connects all user routes under /api/users.
app.use("/api/users", userRoutes);

// Connects all game routes under /api/game.
app.use("/api/game", gameRoutes);

// Connects to MongoDB first, then starts the server if successful.
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // Shows a message when MongoDB connection is successful.
    console.log("MongoDB Connected");

    // Starts the server on port 3000.
    app.listen(3000, () => console.log("Server running on 3000"));
  })
  .catch((err) => 
    // Shows an error message if MongoDB connection fails.
    console.log("MongoDB connection failed:", err.message)
  );
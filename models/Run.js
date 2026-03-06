// Imports mongoose so we can create a schema and model for MongoDB.
import mongoose from "mongoose";

// This schema defines how each game run will be stored in the database.
const runSchema = new mongoose.Schema(
  {
    // Stores the id of the user who played the run.
    // It connects this run to the User collection.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Stores the username at the time the run was saved.
    userName: { type: String, required: true },

    // Stores the user's profile image for leaderboard or run display.
    userImage: { type: String, default: "" },

    // Stores the score earned in this run.
    // Score cannot be less than 0.
    score: { type: Number, required: true, min: 0 },

    // Stores the difficulty level used in this run.
    // Only easy, medium, or hard are allowed.
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  },
  // Automatically adds createdAt and updatedAt fields.
  { timestamps: true }
);

// Exports the Run model so it can be used in other backend files.
export default mongoose.model("Run", runSchema);
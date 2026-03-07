import mongoose from "mongoose";

// Stores one completed game run
const runSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userImage: { type: String, default: "" },
    score: { type: Number, required: true, min: 0 },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Run", runSchema);
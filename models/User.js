import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    userName: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    image: { type: String, default: "/images/default.jpg" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
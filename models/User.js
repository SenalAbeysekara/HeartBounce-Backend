// Imports mongoose so we can define the user structure for MongoDB.
import mongoose from "mongoose";

// This schema defines how user data will be stored in the database.
const userSchema = new mongoose.Schema(
  {
    // Stores the user's email address.
    // It must be unique, required, and will be saved in lowercase without extra spaces.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // Stores the username chosen by the user.
    // Extra spaces at the beginning and end will be removed.
    userName: { type: String, required: true, trim: true },

    // Stores the user's password.
    password: { type: String, required: true },

    // Stores the user's profile image path.
    // If no image is provided, a default image will be used.
    image: { type: String, default: "/images/default.jpg" },
  },
  // Automatically adds createdAt and updatedAt fields.
  { timestamps: true }
);

// Exports the User model so it can be used in other backend files.
export default mongoose.model("User", userSchema);
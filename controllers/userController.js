// Imports jsonwebtoken to create authentication tokens.
import jwt from "jsonwebtoken";

// Imports bcrypt to hash passwords and compare them securely.
import bcrypt from "bcrypt";

// Imports the User model for user-related database actions.
import User from "../models/User.js";

// Imports the Run model so user-related changes can also update saved runs.
import Run from "../models/Run.js";

// Creates a new user account.
export async function register(req, res) {
  try {
    // Gets registration data sent from the frontend.
    const { email, userName, password } = req.body;

    // Checks if any required field is missing.
    if (!email || !userName || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Checks whether the email is already registered.
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already used" });

    // Hashes the password before saving it in the database.
    const hashed = await bcrypt.hash(password, 10);

    // Creates a default avatar image URL based on the username.
    const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${userName}`;

    // Saves the new user in the database.
    await User.create({ email, userName, password: hashed, image: avatar });

    // Sends success response after account creation.
    res.status(201).json({ message: "User created" });
  } catch (e) {
    // Sends error response if something goes wrong.
    res.status(500).json({ message: "Error creating user" });
  }
}

// Logs a user into the system.
export async function login(req, res) {
  try {
    // Gets login details from the request body.
    const { email, password, rememberMe } = req.body;

    // Searches for a user with the given email.
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User Not Found" });

    // Compares the entered password with the hashed password in the database.
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid Password" });

    // Creates a JWT token containing important user details.
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        userName: user.userName,
        image: user.image,
      },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "30d" : "48h" }
    );

    // Stores the token inside an HTTP-only cookie for secure authentication.
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      expires: new Date(
        Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 48 * 60 * 60 * 1000)
      ),
    });

    // Sends success response after login.
    res.status(200).json({ message: "Login Successful" });
  } catch {
    // Sends error response if login fails unexpectedly.
    res.status(500).json({ message: "Server Error" });
  }
}

// Returns the currently logged-in user's data.
export async function me(req, res) {
  res.status(200).json({ user: req.user });
}

// Logs the user out by clearing the auth cookie.
export async function logout(req, res) {
  res.clearCookie("auth_token", {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({ message: "Logged out" });
}

// Changes the user's password after checking the current password.
export async function resetPassword(req, res) {
  try {
    // Gets password reset data from the request body.
    const { email, currentPassword, newPassword } = req.body;

    // Checks whether all required fields were provided.
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Ensures the new password has a minimum length.
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    // Finds the user by email.
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User Not Found" });

    // Verifies that the current password is correct.
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ message: "Current password is incorrect" });

    // Hashes and saves the new password.
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Sends success response after updating the password.
    res.status(200).json({ message: "Password updated successfully" });
  } catch {
    // Sends error response if something fails.
    res.status(500).json({ message: "Server error" });
  }
}

// Updates the logged-in user's username.
export async function updateUserName(req, res) {
  try {
    // Gets the new username from the request body.
    const { userName } = req.body;

    // Checks that the new username is valid.
    if (!userName || userName.trim().length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }

    // Removes extra spaces from the username.
    const cleanName = userName.trim();

    // Finds the currently logged-in user by id.
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User Not Found" });

    // Updates the username in the user document.
    user.userName = cleanName;
    await user.save();

    // Updates the username in all previous saved runs as well.
    await Run.updateMany(
      { userId: user._id },
      { $set: { userName: cleanName } }
    );

    // Sends updated user data back to the frontend.
    res.status(200).json({
      message: "Username updated",
      user: {
        userId: user._id,
        email: user.email,
        userName: user.userName,
        image: user.image,
      },
    });
  } catch {
    // Sends error response if the update fails.
    res.status(500).json({ message: "Server error" });
  }
}
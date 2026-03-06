import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

// REGISTER
export async function register(req, res) {
  try {
    const { email, userName, password } = req.body;

    if (!email || !userName || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);
    const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${userName}`;

    await User.create({ email, userName, password: hashed, image: avatar });

    res.status(201).json({ message: "User created" });
  } catch (e) {
    res.status(500).json({ message: "Error creating user" });
  }
}

// LOGIN
export async function login(req, res) {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User Not Found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid Password" });

    const token = jwt.sign(
      {
        userId: user._id, // ✅ required
        email: user.email,
        userName: user.userName,
        image: user.image,
      },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "30d" : "48h" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      expires: new Date(
        Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 48 * 60 * 60 * 1000)
      ),
    });

    res.status(200).json({ message: "Login Successful" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
}

// ME
export async function me(req, res) {
  res.status(200).json({ user: req.user });
}

// LOGOUT
export async function logout(req, res) {
  res.clearCookie("auth_token", {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "Logged out" });
}

// RESET PASSWORD (simple)
export async function resetPassword(req, res) {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing fields" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User Not Found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

// EDIT USERNAME (protected)
export async function updateUserName(req, res) {
  try {
    const { userName } = req.body;
    if (!userName || userName.trim().length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User Not Found" });

    user.userName = userName.trim();
    await user.save();

    // Optional: return updated user data (frontend updates UI immediately)
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
    res.status(500).json({ message: "Server error" });
  }
}
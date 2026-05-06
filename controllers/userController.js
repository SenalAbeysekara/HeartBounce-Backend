import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Run from "../models/Run.js";

export async function register(req, res) {
  try {
    const { email, userName, password } = req.body;

    if (!email || !userName || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
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

export async function login(req, res) {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User Not Found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid Password" });

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

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true,      // ← changed from false
      sameSite: "none",  // ← changed from "Lax"
      expires: new Date(
        Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 48 * 60 * 60 * 1000)
      ),
    });

    res.status(200).json({ message: "Login Successful" });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
}

export async function me(req, res) {
  res.status(200).json({ user: req.user });
}

export async function logout(req, res) {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: true,      // ← change from false
    sameSite: "none",  // ← change from "Lax"
  });

  res.status(200).json({ message: "Logged out" });
}

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

export async function updateUserName(req, res) {
  try {
    const { userName } = req.body;

    const cleanName = userName.trim();

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User Not Found" });

    user.userName = cleanName;
    await user.save();

    await Run.updateMany({ userId: user._id }, { $set: { userName: cleanName } });

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

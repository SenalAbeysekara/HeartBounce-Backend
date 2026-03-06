import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // must include userId
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}
// src/middleware/auth.js
import jwt from "jsonwebtoken";

// Tokens issued before this timestamp are rejected (set to now on server start)
// To invalidate ALL tokens instantly: update JWT_INVALIDATE_BEFORE in .env
const INVALIDATE_BEFORE = process.env.JWT_INVALIDATE_BEFORE
  ? parseInt(process.env.JWT_INVALIDATE_BEFORE)
  : 0;

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Replay attack mitigation: reject tokens issued before invalidation timestamp
    if (INVALIDATE_BEFORE && payload.iat && payload.iat < INVALIDATE_BEFORE) {
      return res.status(401).json({ error: "Token has been invalidated. Please log in again." });
    }

    req.user = payload; // { id, email, role, name }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d", // Reduced from 7d to 1d
  });
}

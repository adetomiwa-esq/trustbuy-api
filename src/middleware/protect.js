import User from "../models/user.model.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: "Authentication required" });

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (!user || user.isDeleted || !user.isActive) {
      return res.status(401).json({ success: false, message: "Account is unavailable" });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired access token" });
  }
};

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "You do not have permission to perform this action" });
  }
  next();
};

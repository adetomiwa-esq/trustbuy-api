import { randomUUID } from "node:crypto";
import User from "../../models/user.model.js";
import Session from "../../models/session.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import hashToken from "../../utils/hash.js";

const publicUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  role: user.role,
  addresses: user.addresses,
});

const createSession = async (user, req) => {
  const jti = randomUUID();
  const refreshToken = generateRefreshToken(user._id, jti);
  await Session.create({
    user: user._id,
    refreshToken: hashToken(refreshToken),
    deviceName: req.headers["sec-ch-ua-platform"] || "Unknown device",
    browser: req.headers["user-agent"] || "",
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip || "",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return {
    accessToken: generateAccessToken(user._id, user.role),
    refreshToken,
  };
};

export const registerService = async (data, req) => {
  const email = String(data.email || "")
    .trim()
    .toLowerCase();
  if (await User.exists({ email })) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }
  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email,
    phone: data.phone,
    password: data.password,
    role: "CUSTOMER",
  });
  return { user: publicUser(user), ...(await createSession(user, req)) };
};

export const loginService = async (email, password, req) => {
  const user = await User.findOne({
    email: String(email || "")
      .trim()
      .toLowerCase(),
  }).select("+password");
  if (!user || !(await user.comparePassword(password || ""))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }
  if (!user.isActive || user.isDeleted) {
    const error = new Error("Account has been disabled");
    error.statusCode = 403;
    throw error;
  }
  user.lastLogin = new Date();
  await user.save();
  return { user: publicUser(user), ...(await createSession(user, req)) };
};

export const refreshSession = async (token, req) => {
  if (!token) {
    const e = new Error("Refresh session not found");
    e.statusCode = 401;
    throw e;
  }
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    const e = new Error("Refresh token is invalid or expired");
    e.statusCode = 401;
    throw e;
  }
  const hashed = hashToken(token);
  const session = await Session.findOne({
    user: decoded.id,
    refreshToken: hashed,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });
  if (!session) {
    const e = new Error("Refresh session is no longer valid");
    e.statusCode = 401;
    throw e;
  }
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive || user.isDeleted) {
    const e = new Error("Account is unavailable");
    e.statusCode = 401;
    throw e;
  }
  session.isRevoked = true;
  await session.save();
  const tokens = await createSession(user, req);
  return { user: publicUser(user), ...tokens };
};

export const revokeSession = async (token) => {
  if (!token) return;
  await Session.findOneAndUpdate(
    { refreshToken: hashToken(token) },
    { isRevoked: true },
  );
};

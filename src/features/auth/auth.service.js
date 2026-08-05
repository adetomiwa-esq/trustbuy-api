import User from "../../models/user.model.js";
import Session from "../../models/session.model.js";

import { v4 } from "uuid";
const { v4: uuidv4 } = require("uuid");

import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import hashToken from "../../utils/hash.js";

export const registerService = async (data, req) => {
  const existingUser = await User.findOne({
    email: data.email,
  });

  if (existingUser) {
    throw new Error("Email already in use");
  }

  const user = await User.create(data);

  const jti = uuidv4();

  //   const accessToken = generateAccessToken(user);
  const accessToken = generateAccessToken(user._id, user.role);

  const refreshToken = generateRefreshToken(user._id, jti);

  const hashedRefreshToken = hashToken(refreshToken);

  await Session.create({
    user: user._id,

    jti,

    refreshToken: hashedRefreshToken,

    deviceName: req.headers["sec-ch-ua-platform"] || "Unknown",

    browser: req.headers["user-agent"],

    userAgent: req.headers["user-agent"],

    ipAddress: req.ip,

    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const loginService = async (email, password, req) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive || user.isDeleted) {
    throw new Error("Account has been disabled");
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const jti = uuidv4();

  //   const accessToken = generateAccessToken(user);
  const accessToken = generateAccessToken(user._id, user.role);

  const refreshToken = generateRefreshToken(user._id, jti);

  const hashedRefreshToken = hashToken(refreshToken);

  await Session.create({
    user: user._id,

    jti,

    refreshToken: hashedRefreshToken,

    userAgent: req.headers["user-agent"],

    browser: req.headers["user-agent"],

    ipAddress: req.ip,

    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  user.lastLogin = new Date();

  await user.save();

  return {
    user,
    accessToken,
    refreshToken,
  };
};

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

import cookieOptions from "../../config/cookie.config.js";
import User from "../../models/user.model.js";
import {
  loginService,
  refreshSession,
  registerService,
  revokeSession,
} from "./auth.service.js";

const sendAuth = (res, result, status = 200) => {
  res.cookie("refreshToken", result.refreshToken, cookieOptions);
  res
    .status(status)
    .json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
    });
};

export const register = async (req, res, next) => {
  try {
    sendAuth(res, await registerService(req.body, req), 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    sendAuth(res, await loginService(req.body.email, req.body.password, req));
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    sendAuth(res, await refreshSession(req.cookies?.refreshToken, req));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await revokeSession(req.cookies?.refreshToken);
    res
      .clearCookie("refreshToken", { ...cookieOptions, maxAge: undefined })
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      addresses: user.addresses,
    },
  });
};

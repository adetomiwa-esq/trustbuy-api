import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/user.model.js";
import generateToken from "../../utils/generateToken.js";

const User = require("../../models/user.model.js");

const generateToken = require("../../utils/generateToken.js");

export const register = async (req, res, next) => {
  try {
    const {
      firstName,

      lastName,

      email,

      phone,

      password,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,

        message: "Email already exists",
      });
    }

    const user = await User.create({
      firstName,

      lastName,

      email,

      phone,

      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,

      token,

      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const {
      email,

      password,
    } = req.body;

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,

        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,

        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    user.password = undefined;

    res.json({
      success: true,

      token,

      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: generate JWT
 */
// const generateToken = (userId) => {
//   return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//     expiresIn: "7d",
//   });
// };

/**
 * @desc Register user
 * @route POST /api/auth/register
 */
// export const register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already in use" });
//     }

//     // hash password
//     const hashedPassword = await bcrypt.hash(password, 12);

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role: "user",
//     });

//     const token = generateToken(user._id);

//     res
//       .cookie("token", token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "strict",
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//       })
//       .status(201)
//       .json({
//         message: "Registration successful",
//         user: {
//           id: user._id,
//           name: user.name,
//           email: user.email,
//         },
//       });
//   } catch (error) {
//     res.status(500).json({ message: "Registration failed" });
//   }
// };

/**
 * @desc Login user
 * @route POST /api/auth/login
 */
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email }).select("+password");
//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = generateToken(user._id);

//     res
//       .cookie("token", token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "strict",
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//       })
//       .json({
//         message: "Login successful",
//         user: {
//           id: user._id,
//           name: user.name,
//           email: user.email,
//         },
//       });
//   } catch {
//     res.status(500).json({ message: "Login failed" });
//   }
// };

/**
 * @desc Logout
 * @route POST /api/auth/logout
 */
// export const logout = (req, res) => {
//   res.clearCookie("token").json({ message: "Logged out successfully" });
// };

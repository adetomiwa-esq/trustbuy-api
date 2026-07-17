// Why is there a separate session model?
// It supports multiple devices, multiple browsers, suspicious login detection, refresh token rotation, login history, device history, logout from one device, logout from all devices

import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshToken: {
      type: String,
      required: true,
      unique: true,
    },

    deviceName: {
      type: String,
      default: "Unknown Device",
      trim: true,
    },

    browser: {
      type: String,
      default: "",
      trim: true,
    },

    operatingSystem: {
      type: String,
      default: "",
      trim: true,
    },

    ipAddress: {
      type: String,
      default: "",
    },

    userAgent: {
      type: String,
      default: "",
    },

    location: {
      country: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },
    },

    isRevoked: {
      type: Boolean,
      default: false,
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SessionModel = mongoose.model("Session", sessionSchema);

export default SessionModel;

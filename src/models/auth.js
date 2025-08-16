const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 100,
    },
    email: {
      type: String,
      required: true,
      maxLength: 100,
      unique: true,
    },
    password: {
      type: String,
      maxLength: 100,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    authType: {
      type: String,
      maxLength: 100,
    },
    token: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      default: "0",
      enum: ["0", "1", "2"], //0-inactive, 1- active, 2- deleted
    },
    loginHistory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserLoginHistory",
    },
    tokenExpiresAt: {
      type: Date,
      required: false,
    },
    last_login: {
      type: Date,
    },
    lastLoginIp: {
      type: String,
      maxLength: 191,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", authSchema);

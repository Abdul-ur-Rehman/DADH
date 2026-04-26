const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 255,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 255,
      match: [/.+@.+\..+/, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["superadmin", "subadmin"],
      required: true,
      default: "superadmin",
    },
    status: {
      type: Number,
      enum: [0, 1], // 0 = inactive, 1 = active
      default: 1,
    },
    role: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;

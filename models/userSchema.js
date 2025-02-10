import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    externalId: {
      type: Number,
      required: true,
      unique: true,
    },
    roleId: {
      type: Number,
      default: 0,
    },
    roleName: {
      type: String,
      enum: ["Admin", "User"],
    },
    officeId: {
      type: Number,
      default: 0,
    },
    officeName: {
      type: String,
    },
    departmentId: {
      type: Number,
    },
    departmentName: {
      type: String,
    },
    designation: {
      type: String,
    },
    email: {
      type: String,
    },
    name: {
      type: String,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },
    mobile: {
      type: Number,
      default: 0,
    },
    profilePic: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);

export default User;

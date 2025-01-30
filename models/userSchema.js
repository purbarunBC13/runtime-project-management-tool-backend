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
      required: true,
    },
    roleName: {
      type: String,
      enum: ["Admin", "User"],
      required: true,
    },
    officeId: {
      type: Number,
      required: true,
    },
    officeName: {
      type: String,
      required: true,
    },
    departmentId: {
      type: Number,
      required: true,
    },
    departmentName: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      // required: true,
    },
    gender: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
    mobile: {
      type: Number,
      required: true,
      unique: true,
    },
    profilePic: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);

export default User;

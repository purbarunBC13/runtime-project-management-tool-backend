import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      enum: ["Admin", "User"],
      required: true,
    },
    permissions: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);

export default Role;

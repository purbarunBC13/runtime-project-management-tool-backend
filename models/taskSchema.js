import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    creator_role: {
      type: String,
      enum: ["Admin", "User"],
      required: true,
    },
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    finishDate: {
      type: Date,
      required: true,
    },
    finishTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Initiated", "Ongoing", "Completed"],
      required: true,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;

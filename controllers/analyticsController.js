import Task from "../models/taskSchema.js";
import User from "../models/userSchema.js";
import ResponseHandler from "../utils/responseHandler.js";

export const getTaskByStatus = async (req, res) => {
  try {
    const userName = req.query.userName;

    const userId = await User.findOne({ name: userName }, { _id: 1 });

    if (!userId) {
      return ResponseHandler.error(res, "User not found", 404);
    }

    const tasks = await Task.aggregate([
      { $match: { user: userId._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const responsePayload = tasks.map((task) => ({
      status: task._id,
      count: task.count,
      fill:
        task._id === "completed"
          ? "var(--color-completed)"
          : task._id === "ongoing"
          ? "var(--color-ongoing)"
          : "var(--color-initiated)",
    }));

    const totalTasks = responsePayload.reduce(
      (acc, curr) => acc + curr.count,
      0
    );

    return ResponseHandler.success(res, "Task status fetched successfully", {
      tasks: responsePayload,
      totalTasks,
    });
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};

export const getTaskPerProject = async (req, res) => {
  try {
    const userName = req.query.userName;

    if (!userName) {
      return ResponseHandler.error(res, "User name is required", 400);
    }

    const userId = await User.findOne({ name: userName }, { _id: 1 });

    if (!userId) {
      return ResponseHandler.error(res, "User not found", 404);
    }

    const tasks = await Task.aggregate([
      { $match: { user: userId._id } },
      {
        $lookup: {
          from: "projects",
          localField: "project",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      {
        $group: {
          _id: "$project.projectName",
          count: { $sum: 1 },
        },
      },
    ]);

    const responsePayload = tasks.map((task) => ({
      projectName: task._id,
      totalTasks: task.count,
    }));

    const totalTasks = responsePayload.reduce(
      (acc, curr) => acc + curr.count,
      0
    );

    return ResponseHandler.success(
      res,
      "Task per project fetched successfully",
      {
        tasks: responsePayload,
        totalTasks,
      }
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};

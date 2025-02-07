import Task from "../models/taskSchema.js";
import User from "../models/userSchema.js";
import ResponseHandler from "../utils/responseHandler.js";

export const getTaskByStatus = async (req, res) => {
  try {
    let userId = null;
    const roleId = req.roleId;
    const userName = req.query.userName;

    if (roleId === 1) {
      userId = await User.findOne(
        {
          name: userName,
        },
        { _id: 1 }
      );
    } else {
      userId = await User.findOne(
        {
          externalId: req.externalId,
        },
        { _id: 1 }
      );
    }

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
    let userId = null;
    const roleId = req.roleId;

    if (roleId === 1) {
      userId = await User.findOne(
        {
          name: userName,
        },
        { _id: 1 }
      );
    } else {
      userId = await User.findOne(
        {
          externalId: req.externalId,
        },
        { _id: 1 }
      );
    }

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

    const total = responsePayload.reduce(
      (acc, curr) => acc + curr.totalTasks,
      0
    );

    return ResponseHandler.success(
      res,
      "Task per project fetched successfully",
      {
        tasks: responsePayload,
        total,
      }
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};

export const getWorkDurationByProject = async (req, res) => {
  try {
    let userId = null;
    const roleId = req.roleId;
    const userName = req.query.userName;

    if (roleId === 1) {
      userId = await User.findOne(
        {
          name: userName,
        },
        { _id: 1 }
      );
    } else {
      userId = await User.findOne(
        {
          externalId: req.externalId,
        },
        { _id: 1 }
      );
    }

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
          totalDuration: {
            $sum: {
              $subtract: [
                { $toDate: "$finishTime" },
                { $toDate: "$startTime" },
              ],
            },
          },
        },
      },
    ]);

    const responsePayload = tasks.map((task) => {
      const durationMs = task.totalDuration;
      const hours = Math.ceil(durationMs / (1000 * 60 * 60));
      // const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      return {
        projectName: task._id,
        duration: hours,
      };
    });

    return ResponseHandler.success(
      res,
      "Work duration by project fetched successfully",
      {
        tasks: responsePayload,
      }
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};

export const getNoOfUsersByProject = async (req, res) => {
  const projectName = req.query.projectName;
  if (!projectName) {
    return ResponseHandler.error(res, "Project name is required", 400);
  }

  try {
    const noOfUsers = await Task.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
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
        $match: { "project.projectName": projectName },
      },
      {
        $group: {
          _id: "$user._id", // Grouping by unique user ID
        },
      },
      {
        $count: "totalUsers", // Count total unique users
      },
    ]);

    const totalUsers = noOfUsers.length ? noOfUsers[0].totalUsers : 0;

    return ResponseHandler.success(
      res,
      "Number of users assigned to project fetched successfully",
      { totalUsers }
    );
  } catch (error) {
    console.log(error);
    return ResponseHandler.error(res, error.message);
  }
};

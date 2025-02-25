import Task from "../models/taskSchema.js";
import User from "../models/userSchema.js";
import moment from "moment";
import ResponseHandler from "../utils/responseHandler.js";
import Project from "../models/projectSchema.js";
import { fill } from "pdfkit";

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

    const moduleStats = await Task.aggregate([
      { $match: { user: userId._id } }, // Filter tasks by user
      {
        $group: {
          _id: "$slug", // Group by module (slug)
          hasCompleted: {
            $max: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }, // 1 if at least one task is "Completed"
          },
        },
      },
      {
        $group: {
          _id: null,
          completedModules: {
            $sum: { $cond: [{ $eq: ["$hasCompleted", 1] }, 1, 0] }, // Count modules as Completed
          },
          ongoingModules: {
            $sum: { $cond: [{ $eq: ["$hasCompleted", 0] }, 1, 0] }, // Count modules as Ongoing
          },
        },
      },
      {
        $project: {
          _id: 0,
          completedModules: 1,
          ongoingModules: 1,
        },
      },
    ]);

    const responsePayload = [
      {
        status: "Completed",
        count: moduleStats[0].completedModules,
        fill: "green",
      },
      {
        status: "Ongoing",
        count: moduleStats[0].ongoingModules,
        fill: "red",
      },
    ];

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
        $project: {
          projectName: "$project.projectName",
          startTime: {
            $dateFromParts: {
              year: 1970,
              month: 1,
              day: 1, // Placeholder Date
              hour: { $hour: { $toDate: "$startTime" } },
              minute: { $minute: { $toDate: "$startTime" } },
              second: { $second: { $toDate: "$startTime" } },
            },
          },
          finishTime: {
            $cond: {
              if: { $ne: ["$finishTime", null] },
              then: {
                $dateFromParts: {
                  year: 1970,
                  month: 1,
                  day: 1, // Placeholder Date
                  hour: { $hour: { $toDate: "$finishTime" } },
                  minute: { $minute: { $toDate: "$finishTime" } },
                  second: { $second: { $toDate: "$finishTime" } },
                },
              },
              else: null,
            },
          },
        },
      },
      {
        $group: {
          _id: "$projectName",
          totalDuration: {
            $sum: {
              $cond: {
                if: { $ne: ["$finishTime", null] },
                then: { $subtract: ["$finishTime", "$startTime"] },
                else: 0,
              },
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

export const getProjectDateAnalytics = async (req, res) => {
  const { projectName } = req.query;

  if (!projectName) {
    return ResponseHandler.error(res, "Project name is required", 400);
  }

  try {
    const project = await Project.findOne({ projectName });

    if (!project) {
      return ResponseHandler.error(res, "Project not found", 404);
    }

    const startDate = moment(project.projectDate);
    const endDate = moment(startDate).add(project.projectPeriod, "days");
    const remainingDays = Math.max(endDate.diff(moment(), "days"), 0); // Avoid negative values
    const exceededDays = Math.max(moment().diff(endDate, "days"), 0); // Avoid negative values

    const analyticsData = {
      projectName: project.projectName,
      startDate: startDate.format("DD-MM-YYYY"),
      endDate: endDate.format("DD-MM-YYYY"),
      remainingDays,
      exceededDays,
    };

    return ResponseHandler.success(
      res,
      "Project analytics data fetched successfully",
      { project: analyticsData }
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message);
  }
};

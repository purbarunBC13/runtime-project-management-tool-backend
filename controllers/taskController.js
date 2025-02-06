import Project from "../models/projectSchema.js";
import Service from "../models/serviceSchema.js";
import Task from "../models/taskSchema.js";
import User from "../models/userSchema.js";
import { logger } from "../utils/logger.js";
import ResponseHandler from "../utils/responseHandler.js";

const dateParser = (date) => {
  if (new Date(date).toString() === "Invalid Date") {
    throw new Error(`${date} is Invalid Date`);
  } else {
    return new Date(date);
  }
};

export const createTask = async (req, res) => {
  try {
    // Extract the ObjectId for creator_id
    const creator = await User.findOne(
      { externalId: req.body.creator_id },
      { _id: 1 }
    );
    if (!creator) {
      return ResponseHandler.error(res, "Creator not found", 404);
    }
    req.body.creator_id = creator._id;

    // Extract the ObjectId for user
    const user = await User.findOne({ externalId: req.body.user }, { _id: 1 });
    if (!user) {
      return ResponseHandler.error(res, "User not found", 404);
    }
    req.body.user = user._id;

    // Extract the ObjectId for project
    const project = await Project.findOne(
      { projectName: req.body.project },
      { _id: 1 }
    );
    if (!project) {
      return ResponseHandler.error(res, "Project not found", 404);
    }
    req.body.project = project._id;

    // Extract the ObjectId for service
    const service = await Service.findOne(
      { serviceName: req.body.service },
      { _id: 1 }
    );
    if (!service) {
      return ResponseHandler.error(res, "Service not found", 404);
    }
    req.body.service = service._id;

    // Parsing Dates
    req.body.date = dateParser(req.body.date);
    req.body.startDate = dateParser(req.body.startDate);
    req.body.finishDate = dateParser(req.body.finishDate);
    req.body.startTime = dateParser(req.body.startTime);
    req.body.finishTime = dateParser(req.body.finishTime);

    if (req.body.startDate > req.body.finishDate) {
      return ResponseHandler.error(
        res,
        "Start Date cannot be greater than Finish Date",
        400
      );
    } else if (req.body.startTime >= req.body.finishTime) {
      return ResponseHandler.error(
        res,
        "Start Time cannot be greater than equal to Finish Time",
        400
      );
    }

    // console.log("Req body", req.body);

    // Create the Task
    const task = await Task.create(req.body);

    return ResponseHandler.success(res, "Task created successfully", task, 201);
  } catch (error) {
    logger.error("Error creating task:", error);
    return ResponseHandler.error(res, error.message, 400);
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const tasks = await Task.find()
      .populate("creator_id user project service")
      .skip(limit * (page - 1))
      .limit(limit);

    if (tasks.length === 0) {
      return ResponseHandler.error(res, "No tasks found", 404);
    }

    const totalTasks = await Task.countDocuments();
    const totalPages = Math.ceil(totalTasks / limit);
    const paginationData = {
      currentPage: page,
      totalPages: totalPages,
      totalTasks: totalTasks,
    };

    return ResponseHandler.success(
      res,
      "All tasks",
      { tasks, paginationData },
      200
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message, 400);
  }
};

export const getTasksByUserId = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userName = req.query.userName;
    const roleId = req.roleId;

    const sortOptions = {};
    if (req.query.sortBy) {
      const sortFields = req.query.sortBy.split(",");
      sortFields.forEach((field) => {
        if (field.startsWith("-")) {
          sortOptions[field.substring(1)] = -1;
        } else {
          sortOptions[field] = 1;
        }
      });
    } else {
      sortOptions.createdAt = -1;
    }

    let filter = {};

    if (req.query.projectName) {
      const projectId = await Project.find(
        {
          projectName: {
            $regex: req.query.projectName,
            $options: "i",
          },
        },
        { _id: 1 }
      );
      filter.project = projectId.map((project) => project._id);
    }

    if (req.query.serviceName || sortOptions.serviceName) {
      const serviceId = await Service.find(
        {
          serviceName: {
            $regex: req.query.serviceName,
            $options: "i",
          },
        },
        { _id: 1 }
      );
      filter.service = serviceId.map((service) => service._id);
    }

    if (req.query.fromDate && req.query.toDate) {
      filter.date = {
        $gte: dateParser(req.query.fromDate),
        $lte: dateParser(req.query.toDate),
      };
    }

    if (req.query.status) {
      filter.status = { $regex: req.query.status, $options: "i" };
    }

    let user = null;

    if (roleId === 1) {
      user = await User.findOne(
        {
          name: userName,
        },
        { _id: 1 }
      );
    } else {
      user = await User.findOne(
        {
          externalId: req.externalId,
        },
        { _id: 1 }
      );
    }

    if (!user) {
      return ResponseHandler.error(res, "User not found", 404);
    }

    filter.user = user._id;

    const totalTasks = await Task.find(filter)
      .populate("creator_id user project service")
      .sort(sortOptions);

    const tasks = totalTasks.slice(limit * (page - 1), limit * page);

    if (tasks.length === 0) {
      return ResponseHandler.error(res, "No tasks found", 404);
    }

    const totalPages = Math.ceil(totalTasks.length / limit);
    const paginationData = {
      currentPage: page,
      totalPages: totalPages,
      totalTasks: totalTasks.length,
    };

    // tasks.forEach((task) => {
    //   console.log(task.status);
    // });

    return ResponseHandler.success(
      res,
      "All tasks",
      { tasks, paginationData },
      200
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message, 400);
  }
};

export const getTasksByCreatorId = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const creator = await User.findOne(
      { externalId: req.externalId },
      { _id: 1 }
    );
    if (!creator) {
      return ResponseHandler.error(res, "Creator not found", 404);
    }

    const tasks = await Task.find({ creator_id: creator._id })
      .skip(limit * (page - 1))
      .limit(limit)
      .populate("creator_id user project service");

    if (tasks.length === 0) {
      return ResponseHandler.error(res, "No tasks found", 404);
    }

    const totalTasks = tasks.length;
    const totalPages = Math.ceil(totalTasks / limit);
    const paginationData = {
      currentPage: page,
      totalPages: totalPages,
      totalTasks: totalTasks,
      limit,
    };
    return ResponseHandler.success(
      res,
      "All tasks",
      { tasks, paginationData },
      200
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message, 400);
  }
};

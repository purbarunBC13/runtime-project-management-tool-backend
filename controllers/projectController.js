import Project from "../models/projectSchema.js";
import { logger } from "../utils/logger.js";
import ResponseHandler from "../utils/responseHandler.js";

export const createProject = async (req, res) => {
  try {
    const projectName = req.body.projectName;
    const projectExists = await Project.findOne({ projectName });
    if (projectExists) {
      return ResponseHandler.error(
        res,
        "Project with this name already exists",
        400
      );
    }
    const project = await Project.create(req.body);
    // logger.info(`Project created: ${project}`);
    return ResponseHandler.success(
      res,
      "Project Created Successfully",
      project,
      201
    );
  } catch (error) {
    logger.error("Error creating project:", error);
    return ResponseHandler.error(res, "Failed to create project", 500, error);
  }
};

export const getAllProjectNames = async (req, res) => {
  try {
    const projectNames = await Project.find({}, { projectName: 1, _id: 0 });
    const responsePayload = projectNames.map((project) => project.projectName);
    return ResponseHandler.success(
      res,
      "All Project Names",
      responsePayload,
      200
    );
  } catch (error) {
    logger.error("Error getting project names:", error);
    return ResponseHandler.error(
      res,
      "Failed to get project names",
      500,
      error
    );
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.projectName) {
      filter.projectName = { $regex: req.query.projectName, $options: "i" };
    }

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

    const projects = await Project.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    if (projects.length === 0) {
      return ResponseHandler.error(res, "No projects found", 404);
    }

    const totalProjects = await Project.countDocuments(filter);
    const totalPages = Math.ceil(totalProjects / limit);

    const paginationData = {
      currentPage: page,
      totalPages,
      totalProjects,
      limit,
    };

    return ResponseHandler.success(
      res,
      "All Projects",
      { projects, paginationData },
      200
    );
  } catch (error) {
    logger.error("Error getting projects:", error);
    return ResponseHandler.error(res, "Failed to get projects", 500, error);
  }
};

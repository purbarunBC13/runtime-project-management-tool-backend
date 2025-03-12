import Project from "../models/projectSchema.js";
import ProjectTypeDesc from "../models/projectTypeDescSchema.js";
import Service from "../models/serviceSchema.js";
import Task from "../models/taskSchema.js";
import { logger } from "../utils/logger.js";
import ResponseHandler from "../utils/responseHandler.js";

export const createProject = async (req, res) => {
  try {
    const projectName = req.body.projectName.trim();
    const projectExists = await Project.findOne({ projectName });
    if (projectExists) {
      return ResponseHandler.error(
        res,
        "Project with this name already exists",
        400
      );
    }
    const projectData = { ...req.body, projectName };
    const project = await Project.create(projectData);
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
    const projectNames = await Project.find(
      {},
      { projectName: 1, _id: 0 },
      {
        sort: { createdAt: -1 },
      }
    );
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
    if (req.query.fromDate && req.query.toDate) {
      const fromDate = new Date(req.query.fromDate);
      const toDate = new Date(req.query.toDate);

      // Remove time portion, keeping only the date (set time to 00:00:00)
      fromDate.setUTCHours(0, 0, 0, 0);
      toDate.setUTCHours(23, 59, 59, 999); // Include the entire day

      if (fromDate <= toDate) {
        filter.projectDate = {
          $gte: fromDate,
          $lte: toDate,
        };
      } else {
        return ResponseHandler.error(
          res,
          "Invalid date range: fromDate must be before or equal to toDate",
          400
        );
      }
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

    const services = await Service.find({
      project: { $in: projects.map((project) => project._id) },
    });

    // Put each service to its project
    const projectsWithServices = projects.map((project) => {
      const projectServices = services.filter(
        (service) => service.project.toString() === project._id.toString()
      );
      // console.log("projectServices", projectServices);
      return {
        ...project.toObject(),
        services: projectServices.map((service) => service.serviceName),
      };
    });

    // console.log("projectsWithServices", projectsWithServices);

    return ResponseHandler.success(
      res,
      "All Projects",
      { projectsWithServices, paginationData },
      200
    );
  } catch (error) {
    logger.error("Error getting projects:", error);
    return ResponseHandler.error(res, "Failed to get projects", 500, error);
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return ResponseHandler.error(res, "Project not found", 404);
    }
    const tasksWithproject = await Task.find({ project: project._id });
    if (tasksWithproject.length) {
      return ResponseHandler.error(
        res,
        "Cannot delete project with associated tasks",
        400
      );
    }
    const servicesWithProject = await Service.find({ project: project._id });
    if (servicesWithProject.length) {
      return ResponseHandler.error(
        res,
        "Cannot delete project with associated services",
        400
      );
    }

    const projectTypeDescWithProject = await ProjectTypeDesc.find({
      project: project._id,
    });
    if (projectTypeDescWithProject.length) {
      return ResponseHandler.error(
        res,
        "Cannot delete project with associated project type descriptions",
        400
      );
    }
    await project.deleteOne();
    return ResponseHandler.success(res, "Project deleted successfully", 200);
  } catch (error) {
    logger.error("Error deleting project:", error);
    return ResponseHandler.error(res, "Failed to delete project", 500, error);
  }
};

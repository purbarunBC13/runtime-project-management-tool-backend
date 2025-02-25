import Project from "../models/projectSchema.js";
import Service from "../models/serviceSchema.js";
import Task from "../models/taskSchema.js";
import { logger } from "../utils/logger.js";
import ResponseHandler from "../utils/responseHandler.js";

export const createService = async (req, res) => {
  try {
    const projectName = req.body.project.trim();

    const existingProject = await Project.findOne({ projectName });

    if (!existingProject) {
      return ResponseHandler.error(res, "Project not found", 404);
    }

    req.body.project = existingProject._id;

    const existingService = await Service.findOne({
      serviceName: req.body.serviceName.trim(),
      project: req.body.project,
    });

    if (existingService) {
      return ResponseHandler.error(res, "Service already exists", 400);
    }

    const serviceData = {
      ...req.body,
      serviceName: req.body.serviceName.trim(),
    };
    const service = await Service.create(serviceData);
    return ResponseHandler.success(
      res,
      "Service Created Successfully",
      service,
      201
    );
  } catch (error) {
    logger.error("Error creating service:", error);
    return ResponseHandler.error(res, "Failed to create service", 500, error);
  }
};

export const getAllServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.serviceName) {
      filter.serviceName = { $regex: req.query.serviceName, $options: "i" };
    }

    if (req.query.projectName) {
      // Fetch matching projects
      const projects = await Project.find({
        projectName: { $regex: req.query.projectName, $options: "i" },
      });

      if (projects.length === 0) {
        return ResponseHandler.error(res, "Project not found", 404);
      }

      // Extract project IDs and apply them to the filter
      filter.project = { $in: projects.map((project) => project._id) };
    }

    const services = await Service.aggregate([
      { $match: filter },
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
          "project.projectName": 1,
          serviceName: 1,
          serviceDescription: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          project: "$project.projectName",
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    if (services.length === 0) {
      return ResponseHandler.error(res, "No services found", 404);
    }

    const totalServices = await Service.countDocuments(filter);
    const totalPages = Math.ceil(totalServices / limit);

    return ResponseHandler.success(
      res,
      "All Services",
      {
        services,
        paginationData: { currentPage: page, totalPages, totalServices, limit },
      },
      200
    );
  } catch (error) {
    logger.error("Error getting services:", error);
    return ResponseHandler.error(res, "Failed to get services", 500, error);
  }
};

export const getServicesByProjectName = async (req, res) => {
  try {
    const projectName = req.params.projectName;

    const project = await Project.findOne({ projectName });

    if (!project) {
      return ResponseHandler.error(res, "Project not found", 404);
    }

    const services = await Service.find({ project: project._id }).populate(
      "project"
    );

    if (!services) {
      return ResponseHandler.error(res, "Service not found", 404);
    } else {
      return ResponseHandler.success(res, "Service found", services, 200);
    }
  } catch (error) {
    logger.error("Error getting service:", error);
    return ResponseHandler.error(res, "Failed to get service", 500, error);
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);
    if (!service) {
      return ResponseHandler.error(res, "Service not found", 404);
    }

    const tasksWithService = await Task.find({ service: service._id });
    if (tasksWithService.length) {
      return ResponseHandler.error(
        res,
        "Cannot delete service with associated tasks",
        400
      );
    }

    await service.deleteOne();
    return ResponseHandler.success(res, "Service deleted successfully", 200);
  } catch (error) {
    logger.error("Error deleting service:", error);
    return ResponseHandler.error(res, "Failed to delete service", 500, error);
  }
};

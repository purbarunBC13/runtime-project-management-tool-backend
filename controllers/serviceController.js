import Project from "../models/projectSchema.js";
import Service from "../models/serviceSchema.js";
import { logger } from "../utils/logger.js";
import ResponseHandler from "../utils/responseHandler.js";

export const createService = async (req, res) => {
  try {
    const projectName = req.body.project;

    const existingProject = await Project.findOne({ projectName });

    if (!existingProject) {
      return ResponseHandler.error(res, "Project not found", 404);
    }

    req.body.project = existingProject._id;

    const existingService = await Service.findOne({
      serviceName: req.body.serviceName,
      project: req.body.project,
    });

    if (existingService) {
      return ResponseHandler.error(res, "Service already exists", 400);
    }

    const service = await Service.create(req.body);
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
      const project = await Project.findOne({
        projectName: req.query.projectName,
      });
      if (!project) {
        return ResponseHandler.error(res, "Project not found", 404);
      }
      filter.project = project._id;
      //   console.log("Project found:", project);
    }

    // console.log("Filter:", filter);

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
      {
        $unwind: "$project",
      },
      {
        $project: {
          "project.projectName": 1,
          serviceName: 1,
          serviceDescription: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
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

    const paginationData = {
      currentPage: page,
      totalPages,
      totalServices,
      limit,
    };

    return ResponseHandler.success(
      res,
      "All Services",
      { services, paginationData },
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

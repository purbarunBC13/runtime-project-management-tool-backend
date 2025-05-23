import Project from "../models/projectSchema.js";
import ProjectTypeDesc from "../models/projectTypeDescSchema.js";
import { logger } from "../utils/logger.js";
import ResponseHandler from "../utils/responseHandler.js";

export const createProjectTypeDesc = async (req, res) => {
  try {
    const project = await Project.findOne({ projectName: req.body.project });
    if (!project) {
      return ResponseHandler.error(res, "Project not found", 404);
    }
    req.body.project = project._id;

    const existingProjectTypeDesc = await ProjectTypeDesc.findOne({
      projectTypeDescription: req.body.projectTypeDescription,
      project: req.body.project,
    });

    if (existingProjectTypeDesc) {
      return ResponseHandler.error(
        res,
        "Project Type Description already exists",
        409
      );
    }

    const projectTypeDesc = await ProjectTypeDesc.create(req.body);
    return ResponseHandler.success(
      res,
      "Project Type Description created successfully",
      projectTypeDesc
    );
  } catch (error) {
    logger.error("Failed to create Project Type Description", error);
    return ResponseHandler.error(
      res,
      "Failed to create Project Type Description",
      500,
      error
    );
  }
};

export const getAllProjectTypeDesc = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.projectTypeDescription) {
      filter.projectTypeDescription = {
        $regex: req.query.projectTypeDescription,
        $options: "i",
      };
    }

    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: "i" };
    }

    if (req.query.projectName) {
      filter.project = { $regex: req.query.projectName, $options: "i" };
      const project = await Project.find({ projectName: filter.project });
      if (!project) {
        return ResponseHandler.error(res, "Project not found", 404);
      }
      filter.project = project.map((project) => project._id);
    }

    const response = await ProjectTypeDesc.find(filter)
      .populate("project")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalTypeDesc = await ProjectTypeDesc.countDocuments(filter);
    if (response.length === 0) {
      return ResponseHandler.error(
        res,
        "No Project Type Description found",
        404
      );
    }

    const paginationData = {
      currentPage: page,
      totalPages: Math.ceil(totalTypeDesc / limit),
      limit,
    };

    return ResponseHandler.success(
      res,
      "Project Type Description fetched successfully",
      { response, paginationData }
    );
  } catch (error) {
    logger.error("Failed to get Project Type Description", error);
    return ResponseHandler.error(
      res,
      "Failed to get Project Type Description",
      500,
      error
    );
  }
};

export const deleteProjectTypeDesc = async (req, res) => {
  try {
    const projectTypeDesc = await ProjectTypeDesc.findById(
      req.params.projectTypeDescId
    );
    if (!projectTypeDesc) {
      return ResponseHandler.error(
        res,
        "Project Type Description not found",
        404
      );
    }

    await projectTypeDesc.deleteOne();
    return ResponseHandler.success(
      res,
      "Project Type Description deleted successfully"
    );
  } catch (error) {
    logger.error("Failed to delete Project Type Description", error);
    return ResponseHandler.error(
      res,
      "Failed to delete Project Type Description",
      500,
      error
    );
  }
};

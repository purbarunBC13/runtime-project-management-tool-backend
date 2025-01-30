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

    if (req.query.projectName) {
      const project = await Project.findOne({
        projectName: req.query.projectName,
      });
      if (!project) {
        return ResponseHandler.error(res, "Project not found", 404);
      }
      filter.project = project._id;
    }

    const response = await ProjectTypeDesc.find(filter)
      .populate("project")
      .skip(skip)
      .limit(limit);

    if (response.length === 0) {
      return ResponseHandler.error(
        res,
        "No Project Type Description found",
        404
      );
    }
    return ResponseHandler.success(
      res,
      "Project Type Description fetched successfully",
      response
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

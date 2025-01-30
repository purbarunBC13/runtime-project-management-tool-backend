import { logger } from "../../utils/logger.js";
import ResponseHandler from "../../utils/responseHandler.js";
import { projectValidationSchema } from "../../utils/validation_schema/projectValidationSchema.js";

export const projectValidation = (req, res, next) => {
  try {
    // console.log(req.body);
    if (req.body.projectDate) {
      req.body.projectDate = new Date(req.body.projectDate);
    }
    projectValidationSchema.parse(req.body);
    next();
  } catch (error) {
    logger.error("Project validation error:", error.errors[0]);
    ResponseHandler.error(res, error.errors[0].message, 400);
  }
};

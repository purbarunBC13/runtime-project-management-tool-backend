import ResponseHandler from "../../utils/responseHandler.js";
import { projectTypeDescValidationSchema } from "../../utils/validation_schema/projectTypeDescValidationSchema.js";

export const projectTypeDescValidation = async (req, res, next) => {
  try {
    await projectTypeDescValidationSchema.parseAsync(req.body);
    next();
  } catch (error) {
    return ResponseHandler.error(res, error.errors[0].message, 400);
  }
};

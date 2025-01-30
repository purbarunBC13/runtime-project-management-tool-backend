import { serviceValidationSchema } from "../../utils/validation_schema/serviceValidationSchema.js";
import ResponseHandler from "../../utils/responseHandler.js";

export const serviceValidation = async (req, res, next) => {
  try {
    await serviceValidationSchema.parseAsync(req.body);
    next();
  } catch (error) {
    return ResponseHandler.error(res, error.errors[0].message, 400);
  }
};

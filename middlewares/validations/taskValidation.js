import ResponseHandler from "../../utils/responseHandler.js";
import { taskValidationSchema } from "../../utils/validation_schema/taskValidationSchema.js";

export const taskValidation = async (req, res, next) => {
  try {
    req.body.creator_role = req.roleId === 1 ? "Admin" : "User";
    req.body.creator_id = req.externalId;
    req.body.user =
      req.body.creator_role === "Admin" ? req.body.user : req.externalId;
    await taskValidationSchema.parseAsync(req.body);
    next();
  } catch (error) {
    return ResponseHandler.error(res, error.errors[0].message, 400);
  }
};

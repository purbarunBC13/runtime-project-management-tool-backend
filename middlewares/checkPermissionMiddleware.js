import Role from "../models/roleSchema.js";
import ResponseHandler from "../utils/responseHandler.js";

export const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const role_name = req.roleId === 1 ? "Admin" : "User";

      const role = await Role.findOne({ roleName: role_name });
      if (!role) {
        return ResponseHandler.error(res, "Role not found", 404);
      }

      if (role.permissions.includes(permission)) {
        next();
      } else {
        return ResponseHandler.error(
          res,
          "You do not have permission to access this route",
          403
        );
      }
    } catch (error) {
      console.error("Error checking permission:", error);
      return ResponseHandler.error(
        res,
        "Error checking permission",
        500,
        error
      );
    }
  };
};

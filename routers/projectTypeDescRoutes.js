import express from "express";
import { verifyToken } from "../middlewares/authMidlleware.js";
import { checkPermission } from "../middlewares/checkPermissionMiddleware.js";
import { projectTypeDescValidation } from "../middlewares/validations/projectTypeDescValidation.js";
import {
  createProjectTypeDesc,
  deleteProjectTypeDesc,
  getAllProjectTypeDesc,
} from "../controllers/projectTypeDescController.js";

const projectTypeDescRouter = express.Router();

projectTypeDescRouter.use(verifyToken);

projectTypeDescRouter.post(
  "/create",
  checkPermission("create_project_type_description"),
  projectTypeDescValidation,
  createProjectTypeDesc
);

projectTypeDescRouter.get(
  "/all",
  checkPermission("read_project_type_description"),
  getAllProjectTypeDesc
);

projectTypeDescRouter.delete(
  "/delete/:projectTypeDescId",
  checkPermission("delete_project_type_description"),
  deleteProjectTypeDesc
);
export default projectTypeDescRouter;

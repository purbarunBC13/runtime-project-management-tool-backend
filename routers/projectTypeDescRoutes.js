import express from "express";
import { verifyToken } from "../middlewares/authMidlleware.js";
import { checkPermission } from "../middlewares/checkPermissionMiddleware.js";
import { projectTypeDescValidation } from "../middlewares/validations/projectTypeDescValidation.js";
import {
  createProjectTypeDesc,
  getAllProjectTypeDesc,
} from "../controllers/projectTypeDescController.js";

const projectTypeDescRouter = express.Router();

projectTypeDescRouter.post(
  "/create",
  verifyToken,
  checkPermission("create_project_type_description"),
  projectTypeDescValidation,
  createProjectTypeDesc
);

projectTypeDescRouter.get(
  "/all",
  verifyToken,
  checkPermission("read_project_type_description"),
  getAllProjectTypeDesc
);

export default projectTypeDescRouter;

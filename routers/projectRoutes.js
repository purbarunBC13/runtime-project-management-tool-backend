import router from "express";
import { verifyToken } from "../middlewares/authMidlleware.js";
import { projectValidation } from "../middlewares/validations/projectValidation.js";
import { checkPermission } from "../middlewares/checkPermissionMiddleware.js";

import {
  createProject,
  getAllProjectNames,
  getAllProjects,
} from "../controllers/projectController.js";

const projectRouter = router.Router();

projectRouter.post(
  "/create",
  verifyToken,
  checkPermission("create_projects"),
  projectValidation,
  createProject
);

projectRouter.get(
  "/names",
  verifyToken,
  checkPermission("read_projects"),
  getAllProjectNames
);

projectRouter.get(
  "/all",
  verifyToken,
  checkPermission("read_projects"),
  getAllProjects
);

export default projectRouter;

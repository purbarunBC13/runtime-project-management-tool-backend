import router from "express";
import { verifyToken } from "../middlewares/authMidlleware.js";
import { projectValidation } from "../middlewares/validations/projectValidation.js";
import { checkPermission } from "../middlewares/checkPermissionMiddleware.js";

import {
  createProject,
  deleteProject,
  getAllProjectNames,
  getAllProjects,
} from "../controllers/projectController.js";

const projectRouter = router.Router();
projectRouter.use(verifyToken);

projectRouter.post(
  "/create",
  checkPermission("create_projects"),
  projectValidation,
  createProject
);

projectRouter.get(
  "/names",
  checkPermission("read_projects"),
  getAllProjectNames
);

projectRouter.get("/all", checkPermission("read_projects"), getAllProjects);

projectRouter.delete(
  "/delete/:projectId",
  checkPermission("delete_projects"),
  deleteProject
);

export default projectRouter;

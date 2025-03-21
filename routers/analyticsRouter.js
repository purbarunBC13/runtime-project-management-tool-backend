import express from "express";
import { verifyToken } from "../middlewares/authMidlleware.js";
import { checkPermission } from "../middlewares/checkPermissionMiddleware.js";
import {
  getNoOfUsersByProject,
  getProjectDateAnalytics,
  getTaskByStatus,
  getTaskPerProject,
  getWorkDurationByProject,
} from "../controllers/analyticsController.js";

const analyticsRouter = express.Router();

analyticsRouter.use(verifyToken);

analyticsRouter.get(
  "/task-per-status",
  checkPermission("read_analytics"),
  getTaskByStatus
);

analyticsRouter.get(
  "/task-per-project",
  checkPermission("read_analytics"),
  getTaskPerProject
);

analyticsRouter.get(
  "/project-work-duration",
  checkPermission("read_analytics"),
  getWorkDurationByProject
);

analyticsRouter.get(
  "/no-of-user-per-project",
  checkPermission("read_analytics"),
  getNoOfUsersByProject
);

analyticsRouter.get(
  "/project-duration",
  checkPermission("read_analytics"),
  getProjectDateAnalytics
);
export default analyticsRouter;

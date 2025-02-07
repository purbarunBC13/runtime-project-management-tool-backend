import express from "express";
import { verifyToken } from "../middlewares/authMidlleware.js";
import { checkPermission } from "../middlewares/checkPermissionMiddleware.js";
import {
  getNoOfUsersByProject,
  getTaskByStatus,
  getTaskPerProject,
  getWorkDurationByProject,
} from "../controllers/analyticsController.js";

const analyticsRouter = express.Router();

analyticsRouter.get(
  "/task-per-status",
  verifyToken,
  checkPermission("read_analytics"),
  getTaskByStatus
);

analyticsRouter.get(
  "/task-per-project",
  verifyToken,
  checkPermission("read_analytics"),
  getTaskPerProject
);

analyticsRouter.get(
  "/project-work-duration",
  verifyToken,
  checkPermission("read_analytics"),
  getWorkDurationByProject
);

analyticsRouter.get(
  "/no-of-user-per-project",
  verifyToken,
  checkPermission("read_analytics"),
  getNoOfUsersByProject
);

export default analyticsRouter;

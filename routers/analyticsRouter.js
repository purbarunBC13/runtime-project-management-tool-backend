import express from "express";
import { verifyToken } from "../middlewares/authMidlleware.js";
import { checkPermission } from "../middlewares/checkPermissionMiddleware.js";
import {
  getTaskByStatus,
  getTaskPerProject,
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

export default analyticsRouter;

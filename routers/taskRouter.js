import express from "express";
import { taskValidation } from "../middlewares/validations/taskValidation.js";
import { verifyToken } from "../middlewares/authMidlleware.js";
import { checkPermission } from "../middlewares/checkPermissionMiddleware.js";
import {
  continueTaskTomorrow,
  createTask,
  getAllTasks,
  getTaskByTaskId,
  getTasksByUserId,
  sendTaskForExcel,
  sendTaskForPDF,
} from "../controllers/taskController.js";

const taskRouter = express.Router();

taskRouter.post(
  "/create",
  verifyToken,
  checkPermission("create_task"),
  taskValidation,
  createTask
);

taskRouter.patch(
  "/continue-tomorrow",
  verifyToken,
  checkPermission("update_task"),
  continueTaskTomorrow
);

taskRouter.patch(
  "mark-completed",
  verifyToken,
  checkPermission("update_task"),
  continueTaskTomorrow
);

taskRouter.get("/all", verifyToken, checkPermission("read_tasks"), getAllTasks);

taskRouter.get(
  "/get-by-user",
  verifyToken,
  checkPermission("read_task"),
  getTasksByUserId
);

taskRouter.get(
  "/:taskId",
  verifyToken,
  checkPermission("read_task"),
  getTaskByTaskId
);

taskRouter.get(
  "/export-csv",
  verifyToken,
  checkPermission("read_task"),
  sendTaskForExcel
);

taskRouter.get(
  "/export-pdf",
  verifyToken,
  checkPermission("read_task"),
  sendTaskForPDF
);

// TODO: Get Tasks by User for Admin

export default taskRouter;

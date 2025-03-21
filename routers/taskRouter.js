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
  markTaskAsComplete,
  sendTaskForExcel,
  sendTaskForPDF,
  exportTaskCsvByProject,
  exportTaskPdfByProject,
} from "../controllers/taskController.js";

const taskRouter = express.Router();
taskRouter.use(verifyToken);

taskRouter.post(
  "/create",
  checkPermission("create_task"),
  taskValidation,
  createTask
);

taskRouter.patch(
  "/continue-tomorrow",
  checkPermission("update_task"),
  continueTaskTomorrow
);

taskRouter.patch(
  "/mark-completed",
  checkPermission("update_task"),
  markTaskAsComplete
);

taskRouter.get("/all", checkPermission("read_tasks"), getAllTasks);

taskRouter.get("/get-by-user", checkPermission("read_task"), getTasksByUserId);

taskRouter.get("/get/:taskId", checkPermission("read_task"), getTaskByTaskId);

taskRouter.get("/export-csv", checkPermission("read_task"), sendTaskForExcel);

taskRouter.get("/export-pdf", checkPermission("read_task"), sendTaskForPDF);

taskRouter.get(
  "/export-csv-by-project/:projectName",
  checkPermission("read_tasks"),
  exportTaskCsvByProject
);
taskRouter.get(
  "/export-pdf-by-project/:projectName",
  checkPermission("read_tasks"),
  exportTaskPdfByProject
);

// TODO: Get Tasks by User for Admin

export default taskRouter;

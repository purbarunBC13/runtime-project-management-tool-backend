import express from "express";
import { taskValidation } from "../middlewares/validations/taskValidation.js";
import { verifyToken } from "../middlewares/authMidlleware.js";
import { checkPermission } from "../middlewares/checkPermissionMiddleware.js";
import {
  createTask,
  getAllTasks,
  getTasksByUserId,
} from "../controllers/taskController.js";

const taskRouter = express.Router();

taskRouter.post(
  "/create",
  verifyToken,
  checkPermission("create_task"),
  taskValidation,
  createTask
);

taskRouter.get("/all", verifyToken, checkPermission("read_tasks"), getAllTasks);

taskRouter.get(
  "/get-by-user",
  verifyToken,
  checkPermission("read_task"),
  getTasksByUserId
);

// TODO: Get Tasks by User for Admin

export default taskRouter;

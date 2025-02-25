import express from "express";
import { verifyToken } from "../middlewares/authMidlleware.js";
import { serviceValidation } from "../middlewares/validations/serviceValidation.js";
import { checkPermission } from "../middlewares/checkPermissionMiddleware.js";

import {
  createService,
  deleteService,
  getAllServices,
  getServicesByProjectName,
} from "../controllers/serviceController.js";

const serviceRouter = express.Router();

serviceRouter.post(
  "/create",
  verifyToken,
  checkPermission("create_services"),
  serviceValidation,
  createService
);

serviceRouter.get(
  "/all",
  verifyToken,
  checkPermission("read_services"),
  getAllServices
);

serviceRouter.get(
  "/get-by-project/:projectName",
  verifyToken,
  checkPermission("read_services"),
  getServicesByProjectName
);

serviceRouter.delete(
  "/delete/:serviceId",
  verifyToken,
  checkPermission("delete_services"),
  deleteService
);

export default serviceRouter;

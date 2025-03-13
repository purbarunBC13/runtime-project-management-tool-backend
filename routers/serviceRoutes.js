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

serviceRouter.use(verifyToken);

serviceRouter.post(
  "/create",
  checkPermission("create_services"),
  serviceValidation,
  createService
);
serviceRouter.get(
  "/get-by-project",
  checkPermission("read_services"),
  getServicesByProjectName
);
serviceRouter.get("/all", checkPermission("read_services"), getAllServices);

serviceRouter.get(
  "/get-by-project/:projectName",
  checkPermission("read_services"),
  getServicesByProjectName
);

serviceRouter.delete(
  "/delete/:serviceId",
  checkPermission("delete_services"),
  deleteService
);

export default serviceRouter;

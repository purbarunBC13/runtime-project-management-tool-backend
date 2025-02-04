import express from "express";
import {
  getUser,
  getAllUsers,
  getAllUserList,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMidlleware.js";
import { checkPermission } from "../middlewares/checkPermissionMiddleware.js";

const router = express.Router();

router.post("/get-user", verifyToken, checkPermission("read_user"), getUser);
router.get(
  "/get-all-users",
  verifyToken,
  checkPermission("read_users"),
  getAllUsers
);

router.get(
  "/get-user-list",
  verifyToken,
  checkPermission("read_user"),
  getAllUserList
);

export default router;

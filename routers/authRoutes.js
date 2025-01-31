import express from "express";
import { getMe, loginUser, logoutUser } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMidlleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/logout", verifyToken, logoutUser);
router.get("/me", getMe);

export default router;

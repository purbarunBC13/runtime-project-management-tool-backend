import express from "express";
import { loginUser, logoutUser } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMidlleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/logout", verifyToken, logoutUser);
router.get("/new-login/:user_id", loginUser);
// router.get("/me", getMe);

export default router;

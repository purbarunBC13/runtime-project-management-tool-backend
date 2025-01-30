import ResponseHandler from "../utils/responseHandler.js";
import { loginService } from "../services/authServices.js";
import { logger } from "../utils/logger.js";
import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";

export const loginUser = async (req, res) => {
  try {
    const response = await loginService(req.body);

    if (response.status === 200) {
      const userPayload = {
        externalId: response.data.id,
        name: response.data.name,
        roleId: response.data.role_id,
      };

      const token = jwt.sign(userPayload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      const existingUser = await User.findOne({
        externalId: userPayload.externalId,
      });

      if (!existingUser) {
        const newUserPayload = {
          externalId: response.data.id,
          roleId: response.data.role_id,
          roleName: response.data.role_id === 1 ? "Admin" : "User",
          officeId: response.data.office_id,
          officeName: response.data.office_name,
          departmentId: response.data.department_id,
          departmentName: response.data.department_name,
          designation: response.data.designation,
          email: response.data.email,
          name: response.data.name,
          dob: response.data.dob,
          gender: response.data.gender,
          mobile: response.data.mobile,
          profilePic: response.data.profilepic,
        };

        try {
          await User.create(newUserPayload);
          logger.info("New user created in the database");
        } catch (createError) {
          logger.error("Error creating user:", createError);
          return ResponseHandler.error(
            res,
            "Failed to save user in the database",
            500,
            createError
          );
        }
      } else {
        logger.info("User already exists in the database");
      }

      // res.cookie("auth_token", token, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production", // Secure only in production
      //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Adjust for development
      //   maxAge: 24 * 60 * 60 * 1000, // 1 day
      // });
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: false, // Secure only in production
        sameSite: "none", // Adjust for development
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return ResponseHandler.success(res, "User logged in successfully");
    } else {
      console.log(response.message.data.error);
      return ResponseHandler.error(
        res,
        "Failed logging in user",
        400,
        response.message.data.error
      );
    }
  } catch (error) {
    logger.error("Error during login:", error);
    return ResponseHandler.error(
      res,
      "Failed logging in user",
      500,
      error.message
    );
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("auth_token");
    return ResponseHandler.success(res, "User logged out successfully");
  } catch (error) {
    logger.error("Error during logout:", error);
    return ResponseHandler.error(
      res,
      "Failed logging out user",
      500,
      error.message
    );
  }
};

import ResponseHandler from "../utils/responseHandler.js";
import { loginService } from "../services/authServices.js";
import { logger } from "../utils/logger.js";
import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";
const maxAge = 24 * 60 * 60 * 1000;
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
        expiresIn: maxAge,
      });

      const existingUser = await User.findOne({
        externalId: userPayload.externalId,
      });

      console.log("Existing user:", response.data);
      if (!existingUser) {
        const newUserPayload = {
          externalId: response.data.id,
          roleId: response.data.role_id,
          roleName: response.data.role_id === 1 ? "Admin" : "User",
          officeId: response.data.office_id,
          officeName: response.data.office_name || null,
          departmentId: response.data.department_id || null,
          departmentName: response.data.department_name || null,
          designation: response.data.designation || null,
          email: response.data.email || null,
          name: response.data.name || null,
          dob: response.data.dob || null,
          gender: response.data.gender,
          mobile: response.data.mobile || 123,
          profilePic: response.data.profilepic || null,
        };
        console.log("New user payload:", newUserPayload);
        try {
          await User.create(newUserPayload);
          logger.info("New user created in the database");
        } catch (createError) {
          console.log("Error creating user:", createError);
          return ResponseHandler.error(
            res,
            "Failed to save user in the database",
            500
          );
        }
      } else {
        logger.info("User already exists in the database");
      }

      // TODO: Check if this works in localhost
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure only in production
        sameSite: process.env.NODE_ENV === "production" ? "None" : "lax", // Adjust for development
        maxAge: maxAge,
      });

      // req.session.jwt = token;

      return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        data: {
          token,
          user: {
            name: response.data.name,
            role: response.data.role_id === 1 ? "Admin" : "User",
          },
        },
      });
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
  // console.log("Logging out user");
  try {
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax", // Adjust for development
    });
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

// export const getMe = async (req, res) => {
//   try {
//     const token = req.cookies.auth_token;
//     if (!token) {
//       return ResponseHandler.error(res, "Not authenticated", 401);
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findOne({ externalId: decoded.externalId });

//     if (!user) {
//       return ResponseHandler.error(res, "User not found", 404);
//     }

//     return ResponseHandler.success(res, "User authenticated", {
//       name: user.name,
//       role: user.roleId === 1 ? "Admin" : "User",
//     });
//   } catch (error) {
//     return ResponseHandler.error(res, "Invalid token", 401);
//   }
// };

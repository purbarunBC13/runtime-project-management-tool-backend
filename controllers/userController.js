import {
  getAllUsersService,
  getUserService,
} from "../services/userServices.js";
import { logger } from "../utils/logger.js";
import ResponseHandler from "../utils/responseHandler.js";

export const getUser = async (req, res) => {
  try {
    const response = await getUserService(req.externalId);
    if (response.status === 200) {
      return ResponseHandler.success(
        res,
        "User fetched successfully",
        response.data
      );
    } else {
      return ResponseHandler.error(res, response.data, response.status);
    }
  } catch (error) {
    logger.error("Failed to get user", error);
    return ResponseHandler.error(res, "Failed to get user", 500, error);
  }
};

export const getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const userName = req.query.userName;

  try {
    const response = await getAllUsersService();
    const totalUsers = response.data.length;
    if (response.status === 200) {
      const users = response.data.slice(skip, skip + limit).filter((user) => {
        if (userName) {
          return user.name.toLowerCase().includes(userName.toLowerCase());
        }
        return true;
      });
      response.data = users;
      const paginationData = {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        limit,
        totalUsers: totalUsers,
      };
      return ResponseHandler.success(res, "Users fetched successfully", {
        users,
        paginationData,
      });
    } else {
      return ResponseHandler.error(
        res,
        "Error fetching user",
        response.data,
        response.status
      );
    }
  } catch (error) {
    logger.error("Failed to get all users", error);
    return ResponseHandler.error(res, "Failed to get all users", 500, error);
  }
};

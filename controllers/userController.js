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
      return ResponseHandler.success(res, response.data);
    } else {
      return ResponseHandler.error(res, response.data, response.status);
    }
  } catch (error) {
    logger.error("Failed to get user", error);
    return ResponseHandler.error(res, "Failed to get user", 500, error);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const response = await getAllUsersService();
    if (response.status === 200) {
      return ResponseHandler.success(
        res,
        "Users fetched successfully",
        response.data
      );
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

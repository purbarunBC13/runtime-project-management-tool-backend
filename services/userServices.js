import axios from "axios";
import { logger } from "../utils/logger.js";

export const getUserService = async (userId) => {
  const AUTH_SERVICE_BASE_URL = process.env.AUTH_SERVICE_BASE_URL;
  const payload = {
    user_id: userId,
  };
  try {
    const response = await axios.post(
      `${AUTH_SERVICE_BASE_URL}/get_profile_details`,
      payload
    );
    return response.data;
  } catch (error) {
    logger.error(error || "User service error");
    throw new Error(error || "User service error");
  }
};

export const getAllUsersService = async () => {
  const AUTH_SERVICE_BASE_URL = process.env.AUTH_SERVICE_BASE_URL;
  try {
    const response = await axios.post(`${AUTH_SERVICE_BASE_URL}/users_list`);
    logger.info("All users data", response.data);
    return response.data;
  } catch (error) {
    logger.error(error || "User service error");
    throw new Error(error || "User service error");
  }
};

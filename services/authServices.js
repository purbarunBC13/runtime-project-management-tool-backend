import axios from "axios";
import { logger } from "../utils/logger.js";

export const loginService = async (credentials) => {
  const AUTH_SERVICE_BASE_URL = process.env.AUTH_SERVICE_BASE_URL;
  try {
    const response = await axios.get(
      `${AUTH_SERVICE_BASE_URL}/app-login/${credentials}`
    );
    return response.data;
  } catch (error) {
    logger.error(error.response?.data?.response || "Auth service error");
    throw new Error(error.response?.data?.response || "Auth service error");
  }
};

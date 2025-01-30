import { logger } from "../utils/logger.js";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB,
    });
  } catch (error) {
    logger.error(`MongoDB connection error: ${error}`);
    // process.exit(1);
  }
};

export default connectDB;

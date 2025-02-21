import cron from "node-cron";
import mongoose from "mongoose";
import Task from "../models/taskSchema"; // Adjust the path
import moment from "moment-timezone";

// Connect to MongoDB (Ensure it's connected before running the cron job)
mongoose.connect("mongodb://localhost:27017/RuntimeProjectManagement", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

cron.schedule("0 0 * * *", async () => {
  console.log("Running task update job at 12 AM IST...");

  try {
    // Get yesterday's start and end date in IST (formatted for MongoDB)
    const yesterdayStart = moment()
      .tz("Asia/Kolkata")
      .subtract(1, "day")
      .startOf("day");
    const yesterdayEnd = moment()
      .tz("Asia/Kolkata")
      .subtract(1, "day")
      .endOf("day");

    // Set finish time to 8 PM IST yesterday
    const finishTime = moment()
      .tz("Asia/Kolkata")
      .subtract(1, "day")
      .set({ hour: 20, minute: 0, second: 0 });

    console.log("Yesterday Start (IST):", yesterdayStart.format());
    console.log("Yesterday End (IST):", yesterdayEnd.format());
    console.log("Finish Time (IST):", finishTime.format());

    // Find tasks that were "Ongoing" and created yesterday
    const tasks = await Task.find({
      status: "Ongoing",
      startDate: {
        $gte: yesterdayStart.utc().toISOString(),
        $lte: yesterdayEnd.utc().toISOString(),
      },
    });

    if (tasks.length === 0) {
      console.log("No ongoing tasks from yesterday to update.");
      return;
    }

    // Update finishDate & finishTime in IST but store them in UTC ISO format
    await Task.updateMany(
      { _id: { $in: tasks.map((task) => task._id) } },
      {
        $set: {
          finishDate: yesterdayEnd.utc().toISOString(),
          finishTime: finishTime.utc().toISOString(),
        },
      }
    );

    console.log(
      `Updated ${tasks.length} tasks (from yesterday) to set finish date and time.`
    );
  } catch (error) {
    console.error("Error updating ongoing tasks:", error);
  }
});

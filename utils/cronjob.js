import cron from "node-cron";
import Task from "../models/taskSchema.js"; // Adjust the path
import moment from "moment-timezone";

// Start Cron Job
export const startTaskCronJob = () => {
  console.log("✅ Cron job initialized...");

  cron.schedule("0 0 * * *", async () => {
    console.log("🚀 Running task update job at 12 AM IST...");

    const day = moment().utc().day();
    if (day === 1) {
      console.log("🚀 It was Sunday, no tasks to update.", day);
      return;
    }
    try {
      // Get yesterday's start and end date in IST
      const yesterdayStart = moment().utc().subtract(1, "day").startOf("day");
      const yesterdayEnd = moment().utc().subtract(1, "day").endOf("day");

      // Set finish time to 8 PM IST yesterday
      const finishTime = moment()
        .tz("Asia/Kolkata")
        .subtract(1, "day")
        .set({ hour: 20, minute: 0, second: 0 });

      console.log("📅 Yesterday Start (IST):", yesterdayStart.format());
      console.log("📅 Yesterday End (IST):", yesterdayEnd.format());
      console.log("⏰ Finish Time (IST):", finishTime.format());

      // Find tasks that were "Ongoing" and created yesterday
      const tasks = await Task.find({
        status: "Ongoing",
        startDate: {
          $gte: yesterdayStart.format(),
          $lte: yesterdayEnd.format(),
        },
        finishDate: null,
        finishTime: null,
      });

      if (tasks.length === 0) {
        console.log("⚠️ No ongoing tasks from yesterday to update.");
        return;
      }

      // Update finishDate & finishTime for yesterday's tasks
      await Task.updateMany(
        { _id: { $in: tasks.map((task) => task._id) } },
        {
          $set: {
            finishDate: yesterdayEnd.utc().toISOString(),
            finishTime: finishTime.utc().toISOString(),
            status: "Ongoing", // Mark as ongoing
          },
        }
      );

      console.log(
        `✅ Updated ${tasks.length} tasks to mark them as completed.`
      );

      // **Create Ongoing Task for Today (Starting at 9 AM IST)**
      let todayStart;
      if (day === 0) {
        todayStart = moment().utc().add(1, "day").startOf("day");
      } else {
        todayStart = moment().utc().startOf("day");
      }
      const todayStartTime = moment(todayStart)
        .tz("Asia/Kolkata")
        .set({ hour: 10, minute: 30, second: 0 });

      for (const task of tasks) {
        const newTask = new Task({
          creator_role: task.creator_role,
          creator_id: task.creator_id,
          date: todayStart.toISOString(),
          user: task.user,
          project: task.project,
          service: task.service,
          purpose: task.purpose,
          slug: task.slug, // Keep the same slug
          startDate: todayStart.toISOString(),
          startTime: todayStartTime.toISOString(),
          finishDate: null,
          finishTime: null,
          status: "Ongoing",
        });

        await newTask.save();
      }

      console.log(`✅ Created ${tasks.length} new ongoing tasks for today.`);
    } catch (error) {
      console.error("❌ Error updating ongoing tasks:", error);
    }
  });
};

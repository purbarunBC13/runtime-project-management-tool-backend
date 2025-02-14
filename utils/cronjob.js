import cron from "node-cron";
import Task from "../models/taskSchema.js"; // Adjust the path
import moment from "moment-timezone";

// Start Cron Job
export const startTaskCronJob = () => {
  console.log("✅ Cron job initialized...");

  cron.schedule("0 0 * * *", async () => {
    console.log("🚀 Running task update job at 12 AM IST...");

    const today = moment().tz("Asia/Kolkata");
    const dayOfWeek = today.day(); // 0 = Sunday, 6 = Saturday

    let carryForwardDay = today.clone(); // Default to today

    // Check if today is Saturday
    if (dayOfWeek === 6) {
      const firstDay = today.clone().startOf("month");
      const firstSaturday = firstDay.clone().day(6);
      if (firstSaturday.date() > 7) firstSaturday.add(7, "days"); // Ensure it's in the 1st week
      const thirdSaturday = firstSaturday.clone().add(14, "days"); // 3rd Saturday

      if (
        today.date() === firstSaturday.date() ||
        today.date() === thirdSaturday.date()
      ) {
        console.log(
          "🚫 1st or 3rd Saturday: Tasks will be carried forward to Monday."
        );
        carryForwardDay = today.clone().add(2, "days"); // Move to Monday
      } else {
        console.log(
          "🛠️ Regular Saturday: Tasks will be carried forward to today."
        );
      }
    }

    // Check if today is Sunday
    if (dayOfWeek === 0) {
      console.log("🚀 Sunday: Tasks will be carried forward to Monday.");
      carryForwardDay = today.clone().add(1, "days"); // Move to Monday
    }

    // Determine yesterday's start and end date in IST
    const yesterdayStart = moment()
      .tz("Asia/Kolkata")
      .subtract(1, "day")
      .startOf("day");
    const yesterdayEnd = moment()
      .tz("Asia/Kolkata")
      .subtract(1, "day")
      .endOf("day");

    // Set finish time to 8 PM IST yesterday
    const finishTime = yesterdayEnd
      .clone()
      .set({ hour: 20, minute: 0, second: 0 });

    console.log("Today ", moment().tz("Asia/Kolkata").format());
    console.log(
      "📅 Yesterday Start (IST):",
      yesterdayStart.format(),
      yesterdayStart.toDate()
    );
    console.log(
      "📅 Yesterday End (IST):",
      yesterdayEnd.format(),
      yesterdayEnd.toDate()
    );
    console.log("⏰ Finish Time (IST):", finishTime.format());

    // Fetch ongoing tasks from yesterday
    try {
      const tasks = await Task.find({
        status: "Ongoing",
        startDate: {
          $gte: yesterdayStart.toDate(),
          $lte: yesterdayEnd.toDate(),
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
            finishDate: yesterdayEnd.toISOString(),
            finishTime: finishTime.toISOString(),
            status: "Ongoing", // Mark as ongoing
          },
        }
      );

      console.log(
        `✅ Updated ${tasks.length} tasks to mark them as completed.`
      );

      // Determine carry forward start time
      const carryForwardStart = carryForwardDay
        .clone()
        .tz("Asia/Kolkata")
        .startOf("day");
      console.log(
        "📅 Carry Forward Start (IST):",
        carryForwardStart.toISOString()
      );
      const carryForwardStartTime = carryForwardStart
        .clone()
        .set({ hour: 10, minute: 30, second: 0 });

      // Create new ongoing tasks for the carryforward day
      for (const task of tasks) {
        const newTask = new Task({
          creator_role: task.creator_role,
          creator_id: task.creator_id,
          date: carryForwardStart.toISOString(),
          user: task.user,
          project: task.project,
          service: task.service,
          purpose: task.purpose,
          slug: task.slug, // Keep the same slug
          startDate: carryForwardStart.toISOString(),
          startTime: carryForwardStartTime.toISOString(),
          finishDate: null,
          finishTime: null,
          status: "Ongoing",
        });

        await newTask.save();
      }

      console.log(
        `✅ Created ${
          tasks.length
        } new ongoing tasks for ${carryForwardDay.format("dddd")}.`
      );
    } catch (error) {
      console.error("❌ Error updating ongoing tasks:", error);
    }
  });
};

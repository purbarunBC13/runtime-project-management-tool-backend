import Project from "../models/projectSchema.js";
import Service from "../models/serviceSchema.js";
import Task from "../models/taskSchema.js";
import User from "../models/userSchema.js";
import { logger } from "../utils/logger.js";
import ResponseHandler from "../utils/responseHandler.js";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import moment from "moment-timezone";

// const dateParser = (date) => {
//   if (new Date(date).toString() === "Invalid Date") {
//     throw new Error(`${date} is Invalid Date`);
//   } else {
//     return new Date(date);
//   }
// };

export const createTask = async (req, res) => {
  try {
    // Extract the ObjectId for creator_id
    const creator = await User.findOne(
      { externalId: req.body.creator_id },
      { _id: 1 }
    );
    if (!creator) {
      return ResponseHandler.error(res, "Creator not found", 404);
    }
    req.body.creator_id = creator._id;

    // Extract the ObjectId for user
    const user = await User.findOne(
      { externalId: req.body.user },
      { _id: 1, name: 1 }
    );
    if (!user) {
      return ResponseHandler.error(res, "User not found", 404);
    }
    req.body.user = user._id;

    // Extract the ObjectId for project
    const project = await Project.findOne(
      { projectName: req.body.project },
      { _id: 1, projectName: 1 }
    );
    if (!project) {
      return ResponseHandler.error(res, "Project not found", 404);
    }
    req.body.project = project._id;

    // Extract the ObjectId for service
    const service = await Service.findOne(
      { serviceName: req.body.service },
      { _id: 1, serviceName: 1 }
    );

    if (!service) {
      return ResponseHandler.error(res, "Service not found", 404);
    }
    req.body.service = service._id;

    // **Generate Slug Using Populated Names**
    const slug =
      `${user.name}-${project.projectName}-${service.serviceName}-${req.body.purpose}`
        .toLowerCase()
        .replace(/\s+/g, "-"); // Converts to lowercase and replaces spaces with hyphens

    // **Check if a task with the same slug already exists**
    const existingTask = await Task.findOne({ slug });

    if (existingTask && existingTask.status !== "Completed") {
      return ResponseHandler.error(
        res,
        "A task with the same purpose already exists and is not completed.",
        400
      );
    }

    // Assign slug to request body
    req.body.slug = slug;

    // Convert the startDate and startTime to IST format
    // const startDate = moment(req.body.startDate).tz("Asia/Kolkata").toDate();
    // // req.body.startTime = moment(req.body.startTime).tz("Asia/Kolkata").toDate();

    // console.log(startDate);

    // Create the Task
    const task = await Task.create(req.body);

    return ResponseHandler.success(res, "Task created successfully", task, 201);
  } catch (error) {
    console.error("Error creating task:", error);
    return ResponseHandler.error(res, error.message, 400);
  }
};

export const getAllTasks = async (req, res) => {
  try {
    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 10;

    const projectName = req.query.projectName;

    const filter = {};

    if (projectName) {
      const project = await Project.findOne({ projectName }, { _id: 1 });
      if (!project) {
        return ResponseHandler.error(res, "Project not found", 404);
      }
      filter.project = project._id;
    }

    const tasks = await Task.find(filter)
      .populate("creator_id user project service")
      .sort({ createdAt: -1 });
    // .skip(limit * (page - 1))
    // .limit(limit);

    if (tasks.length === 0) {
      return ResponseHandler.error(res, "No tasks found", 404);
    }

    // const totalTasks = await Task.countDocuments();
    // const totalPages = Math.ceil(totalTasks / limit);
    // const paginationData = {
    //   currentPage: page,
    //   totalPages: totalPages,
    //   totalTasks: totalTasks,
    // };

    // tasks.forEach((task) => {
    //   console.log(task.project.projectName);
    // });

    return ResponseHandler.success(
      res,
      "All tasks",
      // { tasks, paginationData },
      tasks,
      200
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message, 400);
  }
};

export const getTaskByTaskId = async (req, res) => {
  try {
    const taskId = req.params.taskId;

    const task = await Task.findById(taskId).populate(
      "creator_id user project service"
    );

    if (!task) {
      return ResponseHandler.error(res, "Task not found", 404);
    }

    return ResponseHandler.success(
      res,
      "Task retrieved successfully",
      task,
      200
    );
  } catch (error) {
    logger.error("Error retrieving task:", error);
    return ResponseHandler.error(res, error.message, 400);
  }
};

export const getTasksByUserId = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userName = req.query.userName;
    const roleId = req.roleId;

    const sortOptions = {};
    if (req.query.sortBy) {
      const sortFields = req.query.sortBy.split(",");
      sortFields.forEach((field) => {
        if (field.startsWith("-")) {
          sortOptions[field.substring(1)] = -1;
        } else {
          sortOptions[field] = 1;
        }
      });
    } else {
      sortOptions.createdAt = -1;
    }

    let filter = {};

    if (req.query.projectName) {
      const projectId = await Project.find(
        {
          projectName: {
            $regex: req.query.projectName,
            $options: "i",
          },
        },
        { _id: 1 }
      );
      filter.project = projectId.map((project) => project._id);
    }

    if (req.query.serviceName || sortOptions.serviceName) {
      const serviceId = await Service.find(
        {
          serviceName: {
            $regex: req.query.serviceName,
            $options: "i",
          },
        },
        { _id: 1 }
      );
      filter.service = serviceId.map((service) => service._id);
    }
    if (req.query.fromDate && req.query.toDate) {
      const fromDate = new Date(req.query.fromDate);
      const toDate = new Date(req.query.toDate);

      // Remove time portion, keeping only the date (set time to 00:00:00)
      fromDate.setUTCHours(0, 0, 0, 0);
      toDate.setUTCHours(23, 59, 59, 999); // Include the entire day

      if (fromDate <= toDate) {
        filter.date = {
          $gte: fromDate,
          $lte: toDate,
        };
      } else {
        return ResponseHandler.error(
          res,
          "Invalid date range: fromDate must be before or equal to toDate",
          400
        );
      }
    }

    if (req.query.status) {
      filter.status = { $regex: req.query.status, $options: "i" };
    }

    let user = null;

    if (roleId === 1) {
      user = await User.findOne(
        {
          name: userName,
        },
        { _id: 1 }
      );
    } else {
      user = await User.findOne(
        {
          externalId: req.externalId,
        },
        { _id: 1 }
      );
    }

    if (!user) {
      return ResponseHandler.error(res, "User not found", 404);
    }

    filter.user = user._id;

    const totalTasks = await Task.find(filter)
      .populate("creator_id user project service")
      .sort(sortOptions);

    const tasks = totalTasks.slice(limit * (page - 1), limit * page);

    if (tasks.length === 0) {
      return ResponseHandler.error(res, "No tasks found", 404);
    }

    const totalPages = Math.ceil(totalTasks.length / limit);
    const paginationData = {
      currentPage: page,
      totalPages: totalPages,
      totalTasks: totalTasks.length,
    };

    // tasks.forEach((task) => {
    //   console.log(task.status);
    // });

    return ResponseHandler.success(
      res,
      "All tasks",
      { tasks, paginationData },
      200
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message, 400);
  }
};

export const getTasksByCreatorId = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const creator = await User.findOne(
      { externalId: req.externalId },
      { _id: 1 }
    );
    if (!creator) {
      return ResponseHandler.error(res, "Creator not found", 404);
    }

    const tasks = await Task.find({ creator_id: creator._id })
      .skip(limit * (page - 1))
      .limit(limit)
      .populate("creator_id user project service");

    if (tasks.length === 0) {
      return ResponseHandler.error(res, "No tasks found", 404);
    }

    const totalTasks = tasks.length;
    const totalPages = Math.ceil(totalTasks / limit);
    const paginationData = {
      currentPage: page,
      totalPages: totalPages,
      totalTasks: totalTasks,
      limit,
    };
    return ResponseHandler.success(
      res,
      "All tasks",
      { tasks, paginationData },
      200
    );
  } catch (error) {
    return ResponseHandler.error(res, error.message, 400);
  }
};

export const sendTaskForExcel = async (req, res) => {
  console.log("External ID:", req.externalId);
  try {
    const { userName } = req.query;

    // if (!userName) {
    //   return res.status(400).json({
    //     statusCode: 400,
    //     message: "UserName is required in the query",
    //     exception: null,
    //     data: null,
    //   });
    // }

    // Find the user by userName
    const user = await User.findOne({ externalId: req.externalId });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
        exception: null,
        data: null,
      });
    }

    // Fetch only tasks assigned to the user
    const tasks = await Task.find({ user: user._id }).populate(
      "creator_id user project service"
    ); // Populate references

    if (!tasks.length) {
      return res.status(404).json({
        statusCode: 404,
        message: "No tasks found for this user",
        exception: null,
        data: null,
      });
    }

    // Convert timestamps to IST and format data
    const tasksWithIST = tasks.map((task) => ({
      "Task ID": task._id.toString(),
      "Creator Role": task.creator_role,
      "Creator Name": task.creator_id.name,
      Date: moment(task.date).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
      "Assigned User": user.name, // Directly from user object
      Project: task.project?.projectName || "N/A",
      Service: task.service?.serviceName || "N/A",
      Purpose: task.purpose,
      "Start Date": moment(task.startDate)
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD"),
      "Start Time": moment(task.startTime)
        .tz("Asia/Kolkata")
        .format("HH:mm:ss"),
      "Finish Date": moment(task.finishDate)
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD"),
      "Finish Time": moment(task.finishTime)
        .tz("Asia/Kolkata")
        .format("HH:mm:ss"),
      Status: task.status,
    }));

    // Define CSV fields
    const fields = [
      "Task ID",
      "Creator Role",
      "Creator Name",
      "Date",
      "Assigned User",
      "Project",
      "Service",
      "Purpose",
      "Start Date",
      "Start Time",
      "Finish Date",
      "Finish Time",
      "Status",
    ];

    // Convert to CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(tasksWithIST);

    // Send file as response
    res.attachment(`tasks_${userName}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error(error + "Error exporting tasks to CSV");
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to export tasks",
      exception: error,
      data: null,
    });
  }
};

export const sendTaskForPDF = async (req, res) => {
  try {
    const { userName } = req.query;

    // if (!userName) {
    //   return res.status(400).json({
    //     statusCode: 400,
    //     message: "UserName is required in the query",
    //     exception: null,
    //     data: null,
    //   });
    // }

    // Find user by name
    const user = await User.findOne({ externalId: req.externalId });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
        exception: null,
        data: null,
      });
    }

    // Fetch tasks assigned to the user
    const tasks = await Task.find({ user: user._id }).populate(
      "creator_id user project service"
    );

    if (!tasks.length) {
      return res.status(404).json({
        statusCode: 404,
        message: "No tasks found for this user",
        exception: null,
        data: null,
      });
    }

    // Create PDF document
    const doc = new PDFDocument({
      margin: 30,
      size: "A4",
      layout: "landscape",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=tasks_${user.name}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res); // Send PDF as response

    // Title
    doc
      .fontSize(18)
      .fillColor("#333333")
      .text(`Task Report for ${user.name}`, { align: "center" })
      .moveDown(1);

    // Define Table Headers and Column Widths
    const headers = [
      "Creator",
      "Assigned User",
      "Project",
      "Service",
      "Purpose",
      "Start Date",
      "Finish Date",
      "Status",
    ];
    const columnWidths = [80, 80, 120, 100, 120, 90, 90, 70];

    let y = doc.y + 10; // Initial Y position for table

    // Draw Table Headers with Background Color
    doc
      .rect(30, y, doc.page.width - 60, 25)
      .fill("#007ACC")
      .stroke();
    doc.fillColor("white").font("Helvetica-Bold").fontSize(10);

    let x = 30;
    headers.forEach((header, i) => {
      doc.text(header, x + 5, y + 7, {
        width: columnWidths[i],
        align: "center",
      });
      x += columnWidths[i];
    });

    doc.fillColor("black").font("Helvetica").fontSize(9);
    y += 25; // Move down for data rows

    // Draw Table Rows with Dynamic Heights
    tasks.forEach((task, index) => {
      let x = 30;

      const rowData = [
        task.creator_id?.name || "N/A",
        user.name,
        task.project?.projectName || "N/A",
        task.service?.serviceName || "N/A",
        task.purpose,
        moment(task.startDate).tz("Asia/Kolkata").format("MMMM Do YYYY"),
        moment(task.finishDate).tz("Asia/Kolkata").format("MMMM Do YYYY"),
        task.status,
      ];

      // Determine the maximum row height based on text wrapping
      let maxRowHeight = 0;
      rowData.forEach((text, i) => {
        let textHeight = doc.heightOfString(text, {
          width: columnWidths[i] - 10,
        });
        maxRowHeight = Math.max(maxRowHeight, textHeight);
      });

      maxRowHeight += 10; // Add padding for readability

      // Check for page overflow and add new page if needed
      if (y + maxRowHeight > doc.page.height - 50) {
        doc.addPage();
        y = 50; // Reset Y position on new page

        // Redraw the table headers on the new page
        doc
          .rect(30, y, doc.page.width - 60, 20)
          .fill("#007ACC")
          .stroke();
        doc.fillColor("white").font("Helvetica-Bold").fontSize(10);

        let x = 30;
        headers.forEach((header, i) => {
          doc.text(header, x + 5, y + 7, {
            width: columnWidths[i],
            align: "center",
          });
          x += columnWidths[i];
        });

        doc.fillColor("black").font("Helvetica").fontSize(9);
        y += 25; // Move down for data rows
      }

      // Alternate row colors for better readability
      if (index % 2 === 0) {
        doc
          .rect(30, y, doc.page.width - 60, maxRowHeight)
          .fill("#F3F3F3")
          .stroke();
      }

      doc.fillColor("black");

      // Draw Text in each column with adjusted row height
      x = 30;
      rowData.forEach((text, i) => {
        doc.text(text, x + 5, y + 5, {
          width: columnWidths[i] - 10,
          align: "center",
        });
        x += columnWidths[i];
      });

      y += maxRowHeight; // Move down for the next row
    });

    doc.end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to export tasks to PDF",
      exception: error,
      data: null,
    });
  }
};

export const continueTaskTomorrow = async (req, res) => {
  try {
    const { taskId } = req.body;

    if (!taskId) {
      return ResponseHandler.error(res, "Task ID is required", 400);
    }

    // Find the existing task by ID
    const existingTask = await Task.findById(taskId);

    if (!existingTask) {
      return ResponseHandler.error(res, "Task not found", 404);
    }

    // Check if the startDate of the task is today or earlier
    const taskStartDate = moment(existingTask.startDate)
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD");
    const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

    if (taskStartDate > todayDate) {
      return ResponseHandler.error(
        res,
        "This task is not for today. It cannot be continued.",
        400
      );
    }

    // **Use the slug from the existing task**
    const { slug } = existingTask;

    // Check if any task under the same module (slug) is already marked "Completed"
    const isModuleCompleted = await Task.exists({
      slug: slug,
      status: "Completed",
    });

    if (isModuleCompleted) {
      return ResponseHandler.error(
        res,
        "Another task in this module is already completed. This task cannot be continued.",
        400
      );
    }

    // Get the current date & time (store in UTC but convert to IST for calculations)
    const currentDateTime = moment().tz("Asia/Kolkata");

    // **Manually rollback if new task creation fails**
    try {
      // Update the existing task with finishDate & finishTime (Stored in UTC)
      existingTask.finishDate = currentDateTime.utc().toISOString();
      existingTask.finishTime = currentDateTime.utc().toISOString();
      await existingTask.save(); // Save update

      // **Fix: Get the correct next day's start date (next day of existing startDate)**
      const nextDayStartDate = moment(existingTask.startDate)
        .tz("Asia/Kolkata")
        .add(1, "day")
        .startOf("day");

      console.log("Next Day Start Date:", nextDayStartDate.format());
      console.log("Current DateTime:", currentDateTime.format());

      // Set start time for the next day (9 AM IST)
      const nextDayStartTime = moment(nextDayStartDate)
        .tz("Asia/Kolkata")
        .set({ hour: 10, minute: 30, second: 0 });

      // Convert to UTC before storing
      // const nextDayStartDateUTC = nextDayStartDate.utc().toISOString();

      const nextDayStartTimeUTC = nextDayStartTime.utc().toISOString();

      const newTask = new Task({
        creator_role: existingTask.creator_role,
        creator_id: existingTask.creator_id,
        date: nextDayStartTimeUTC, // Set the correct start date for the next day
        user: existingTask.user,
        project: existingTask.project,
        service: existingTask.service,
        purpose: existingTask.purpose,
        slug: slug,
        startDate: nextDayStartTimeUTC,
        startTime: nextDayStartTimeUTC,
        finishDate: null,
        finishTime: null,
        status: "Ongoing",
      });

      await newTask.save(); // Create new task

      return ResponseHandler.success(
        res,
        "Task successfully continued for tomorrow",
        newTask,
        200
      );
    } catch (error) {
      console.error("Error while inserting new task, rolling back:", error);

      // **Manual rollback: Undo finishDate & finishTime if new task creation fails**
      existingTask.finishDate = null;
      existingTask.finishTime = null;
      await existingTask.save(); // Revert the update

      return ResponseHandler.error(
        res,
        "Failed to continue task for tomorrow. Changes were rolled back.",
        400
      );
    }
  } catch (error) {
    console.error("Error in continuing task for tomorrow:", error);
    return ResponseHandler.error(res, error.message, 400);
  }
};

export const markTaskAsComplete = async (req, res) => {
  try {
    const { taskId } = req.body;

    if (!taskId) {
      return ResponseHandler.error(res, "Task ID is required.", 400);
    }

    // Find the task by ID
    const existingTask = await Task.findById(taskId);

    if (!existingTask) {
      return ResponseHandler.error(res, "Task not found", 404);
    }

    // Ensure the task is still "Ongoing"
    if (existingTask.status === "Completed") {
      return ResponseHandler.error(
        res,
        "This task is already marked as completed.",
        400
      );
    }

    // **Use the slug from the existing task**
    const { slug } = existingTask;

    // Check if any other task under the same module (slug) is already "Completed"
    const isModuleCompleted = await Task.exists({
      slug: slug,
      status: "Completed",
    });

    if (isModuleCompleted) {
      return ResponseHandler.error(
        res,
        "Another task under this module is already completed. You cannot complete this task.",
        400
      );
    }

    // Get the current date & time in IST
    const currentDateTime = moment().tz("Asia/Kolkata");

    const taskStartDate = moment(existingTask.startDate).format("YYYY-MM-DD");
    const todayDate = currentDateTime.format("YYYY-MM-DD");

    console.log("Task Start Date:", taskStartDate);
    console.log("Today's Date:", todayDate);

    if (taskStartDate > todayDate) {
      return ResponseHandler.error(
        res,
        "This task is not for today. It cannot be completed.",
        400
      );
    }

    // Mark only this task as "Completed"
    existingTask.status = "Completed";
    existingTask.finishDate = currentDateTime.toDate();
    existingTask.finishTime = currentDateTime.toDate();
    await existingTask.save();

    return ResponseHandler.success(
      res,
      "Task marked as completed successfully",
      existingTask,
      200
    );
  } catch (error) {
    console.error("Error marking task as complete:", error);
    return ResponseHandler.error(res, error.message, 400);
  }
};

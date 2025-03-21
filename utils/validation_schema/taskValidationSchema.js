import { z } from "zod";

export const taskValidationSchema = z
  .object({
    creator_role: z
      .string({
        message: "Creator role must be a string",
      })
      .refine((value) => value === "Admin" || value === "User", {
        message: "Creator role must be either 'Admin' or 'User'",
      }),

    creator_id: z.number({ message: "Creator ID is required" }).positive({
      message: "Creator ID must be a positive number",
    }),

    date: z
      .string({ message: "Date is required" })
      .refine((value) => !isNaN(Date.parse(value)), {
        message: "Date must be a valid ISO string",
      }),

    user: z.number({ message: "User ID is required" }).positive({
      message: "User ID must be a positive number",
    }),

    project: z.string({ message: "Project is required" }).nonempty({
      message: "Project cannot be empty",
    }),

    service: z.string({ message: "Service is required" }).nonempty({
      message: "Service cannot be empty",
    }),

    purpose: z.string({ message: "Purpose is required" }).nonempty({
      message: "Purpose cannot be empty",
    }),

    startDate: z
      .string({ message: "Start Date is required" })
      .refine((value) => !isNaN(Date.parse(value)), {
        message: "Start Date must be a valid ISO string",
      }),

    startTime: z
      .string({ message: "Start Time is required" })
      .refine((value) => !isNaN(Date.parse(value)), {
        message: "Start Time must be a valid ISO string",
      }),

    finishDate: z
      .string({ message: "Finish Date is required when status is 'Completed'" })
      .optional()
      .nullable(),

    finishTime: z
      .string({ message: "Finish Time is required when status is 'Completed'" })
      .optional()
      .nullable(),

    status: z
      .string({ message: "Status must be a string" })
      .refine(
        (value) =>
          value === "Initiated" || value === "Ongoing" || value === "Completed",
        {
          message:
            "Status must be either 'Initiated', 'Ongoing', or 'Completed'",
        }
      ),
  })
  .refine(
    (data) =>
      data.status !== "Completed" || (data.finishDate && data.finishTime),
    {
      message:
        "Finish Date and Finish Time are required when status is 'Completed'",
      path: ["finishDate", "finishTime"],
    }
  );

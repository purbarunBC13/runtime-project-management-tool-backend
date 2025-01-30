import { z } from "zod";

export const taskValidationSchema = z.object({
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
  date: z.string({ message: "Date is required" }).nonempty({
    message: "Date cannot be empty",
  }),
  user: z.number({ message: "User is required" }).positive({
    message: "User must be a positive number",
  }),
  project: z.string({ message: "Project is required" }).nonempty({
    message: "project cannot be empty",
  }),
  service: z.string({ message: "Service is required" }).nonempty({
    message: "service cannot be empty",
  }),
  purpose: z.string({ message: "Purpose is required" }).nonempty({
    message: "purpose cannot be empty",
  }),
  startDate: z.string({ message: "start Date is required" }).nonempty({
    message: "start Date cannot be empty",
  }),
  startTime: z.string({ message: "startTime is required" }).nonempty({
    message: "startTime cannot be empty",
  }),
  finishDate: z.string({ message: "finishDate is required" }).nonempty({
    message: "finishDate cannot be empty",
  }),
  finishTime: z.string({ message: "finishTime is required" }).nonempty({
    message: "finishTime cannot be empty",
  }),
  status: z
    .string({ message: "Status must be a string" })
    .refine(
      (value) =>
        value === "Initiated" || value === "Ongoing" || value === "Completed",
      {
        message: "status must be either 'Initiated', 'Ongoing' or 'Completed'",
      }
    ),
});

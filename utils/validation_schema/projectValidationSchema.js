import { z } from "zod";

export const projectValidationSchema = z.object({
  projectName: z
    .string({
      message: "Project name must be a string",
    })
    .min(3, {
      message: "Project name must be at least 3 characters long",
    })
    .max(100, {
      message: "Project name must be at most 100 characters long",
    })
    .nonempty({
      message: "Project name cannot be empty",
    }),

  projectDescription: z
    .string({
      message: "Project description must be a string",
    })
    .min(5, {
      message: "Project description must be at least 5 characters long",
    })
    .max(100, {
      message: "Project description must be at most 100 characters long",
    })
    .nonempty({
      message: "Project description cannot be empty",
    }),

  projectDate: z.date({
    message: "Project date must be a valid date",
  }),

  projectPeriod: z
    .number({
      message: "Project period must be a number",
    })
    .positive({
      message: "Project period must be a positive number",
    }),

  clientName: z
    .string({
      message: "Client name must be a string",
    })
    .min(3, {
      message: "Client name must be at least 3 characters long",
    })
    .max(100, {
      message: "Client name must be at most 100 characters long",
    })
    .nonempty({
      message: "Client name cannot be empty",
    }),

  clientEmail: z
    .string({
      message: "Client email must be a string",
    })
    .email({
      message: "Client email must be a valid email",
    })
    .nonempty({
      message: "Client email cannot be empty",
    }),

  projectType: z
    .string({
      message: "Project type must be a string",
    })
    .min(3, {
      message: "Project type must be at least 3 characters long",
    })
    .max(100, {
      message: "Project type must be at most 100 characters long",
    })
    .nonempty({
      message: "Project type cannot be empty",
    }),

  cost: z
    .number({
      message: "Project cost must be a number",
    })
    .int({
      message: "Project cost must be an integer",
    })
    .positive({
      message: "Project cost must be a positive number",
    }),
});

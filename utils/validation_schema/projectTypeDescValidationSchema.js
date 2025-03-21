import { z } from "zod";

export const projectTypeDescValidationSchema = z.object({
  project: z
    .string({
      message: "Project Name must be a string",
    })
    .nonempty({
      message: "Project Name Required",
    }),
  projectTypeDescription: z
    .string({
      message: "Project Type Description must be a string",
    })
    .min(5, {
      message: "Project Type Description must be at least 5 characters long",
    })
    .max(10000, {
      message: "Project Type Description must be at most 10000 characters long",
    })
    .nonempty({
      message: "Project Type Description cannot be empty",
    }),
  location: z
    .string({
      message: "Location must be a string",
    })
    .optional(),
});

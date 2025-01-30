import { z } from "zod";

export const serviceValidationSchema = z.object({
  project: z
    .string({
      message: "Project Name must be a string",
    })
    .nonempty({
      message: "Project Name Required",
    }),
  serviceName: z
    .string({
      message: "Service name must be a string",
    })
    .min(3, {
      message: "Service name must be at least 3 characters long",
    })
    .max(100, {
      message: "Service name must be at most 100 characters long",
    })
    .nonempty({
      message: "Service name cannot be empty",
    }),
  serviceDescription: z
    .string({
      message: "Service description must be a string",
    })
    .min(5, {
      message: "Service description must be at least 5 characters long",
    })
    .max(100, {
      message: "Service description must be at most 100 characters long",
    })
    .nonempty({
      message: "Service description cannot be empty",
    }),
});

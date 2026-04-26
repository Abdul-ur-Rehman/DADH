const { z } = require("zod");

const signupSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(255, { message: "Username cannot exceed 255 characters" }),

  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid Email Address" })
    .min(8, { message: "Email must be at least 8 characters" })
    .max(255, { message: "Email cannot exceed 255 characters" }),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .max(255, { message: "Password cannot exceed 255 characters" }),

  level: z.enum(["superadmin", "subadmin"], {
    required_error: "Level is required",
    invalid_type_error: "Level must be either 'superadmin' or 'subadmin'",
  }),

  status: z
    .number({ required_error: "Status is required" })
    .int()
    .refine((val) => val === 0 || val === 1, {
      message: "Status must be 0 (inactive) or 1 (active)",
    })
    .default(1),
});

module.exports = signupSchema;

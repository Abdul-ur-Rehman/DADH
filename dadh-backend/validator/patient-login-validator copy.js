const { z } = require("zod");

const loginSchema = z.object({

  medicareNumber: z
    .string({ required_error: "Medicare number is required" })
    .length(10, { message: "Medicare number must be exactly 10 digits" })
    .regex(/^\d+$/, { message: "Medicare number must contain only digits" }),

  phone: z
    .string({ required_error: "Phone number is required" })
    .trim()
    .min(10, { message: "Phone number must be at least 10 characters" })
    .max(15, { message: "Phone number more than 15 characters are not allowed" }),

  DOB: z
    .string({ required_error: "DOB  is required" })
    .trim()
    .min(8, { message: "DOB must be at least 8 characters" })
    .max(20, { message: "DOB more than 20 characters are not allowed" }),

});

module.exports = loginSchema;

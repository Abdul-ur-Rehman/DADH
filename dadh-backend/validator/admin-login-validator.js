const { z } = require("zod");

const signupSchema = z.object({
  username: z
    .string({ required_error: "username is required" })
    .trim()
    .min(3, { message: "username must be at least three characters" })
    .max(255, { message: "username more than 255 characters are not allowed" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least eight characters" })
    .max(255, { message: "Password more than 255 characters are not allowed" }),

});

module.exports = signupSchema;

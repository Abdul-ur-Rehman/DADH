const { z } = require("zod");

const loginSchema = z.object({
  prescriberNumber: z
    .number({ required_error: "Prescriber Number is required" })
    .min(100,  { message: "Prescriber Number must be at least three digits" })
    .max(999,  { message: "Prescriber Number more than 999 is not allowed" }),

  doctorPhone: z.string().min(10).max(20),

});

module.exports = loginSchema;

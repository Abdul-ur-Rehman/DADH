const { z } = require("zod");

const signupSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name must be at least three characters" })
    .max(255, { message: "More than 255 characters are not allowed" }),

  phone: z
    .string({ required_error: "Phone number is required" })
    .trim()
    .min(10, { message: "Phone number must be at least 10 characters" })
    .max(15, {
      message: "Phone number mre than 15 characters are not allowed",
    }),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: `Invallid Email Address` })
    .min(8, { message: "Email At least eight characters" })
    .max(255, { message: "More than 255 characters are not allowed" }),

  city: z
    .string({ required_error: "City name is required" })
    .trim()
    .min(3, { message: "City name at least 3 characters" }),

  state: z
    .string({ required_error: "State name is required" })
    .trim()
    .min(3, { message: "State name must be at least three characters" })
    .max(10, {
      message: "State name more than 100 characters are not allowed",
    }),

  DOB: z
    .string({ required_error: "DOB  is required" })
    .trim()
    .min(3, { message: "DOB must be at least 3 characters" })
    .max(20, { message: "DOB more than 20 characters are not allowed" }),

  // IRN: z.string({
  //   required_error: "IRN is required"
  // }).length(1, {
  //   message: "IRN must be exactly one character"
  // }),


  medicareNumber: z
    .string({ required_error: "Medicare number is required" })
    .length(10, { message: "Medicare number must be exactly 10 digits" })
    .regex(/^\d+$/, { message: "Medicare number must contain only digits" }),


  address: z.string({ required_error: "Address is required" }).trim(),

  zipCode: z.string({ required_error: "ZIP Code is required" }).trim(),

  gender: z.string({ required_error: "Gender is required" }).trim(),

});

module.exports = signupSchema;

const { z } = require("zod");

const signupSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name must be at least three characters" })
    .max(255, { message: "More than 255 characters are not allowed" }),

  surname: z
    .string({ required_error: "Surname is required" })
    .trim()
    .min(3, { message: "Surname must be at least three characters" })
    .max(255, { message: "More than 255 ch  aracters are not allowed" }),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: `Invallid Email Address` })
    .min(8, { message: "Email At least eight characters" })
    .max(255, { message: "More than 255 characters are not allowed" }),

  phone: z
    .string({ required_error: "Phone is required" })
    .trim()
    .min(10, { message: "phone at least 10 characters" })
    .max(20, { message: "More than 20 characters are not allowed" }),

  city: z
    .string({ required_error: "City is required" })
    .trim()
    .min(3, { message: "City must be at least three characters" })
    .max(255, { message: "More than 255 characters are not allowed" }),

  state: z
    .string({ required_error: "State is required" })
    .trim()
    .min(2, { message: "State must be at least two characters" })
    .max(255, { message: "More than 255 characters are not allowed" }),

  doctorType: z
    .string({ required_error: "Doctor Type is required" })
    .trim()
    .min(2, { message: "Doctor Type must be at least three characters" })
    .max(255, { message: "More than 255 characters are not allowed" }),


  isHomeVisit: z
    .string({ required_error: "Home Visit is required" })
    .trim()
    .min(2, { message: "Home Visit must be at least three characters" })
    .max(255, { message: "More than 255 characters are not allowed" }),

  workType: z
    .string({ required_error: "Work Type is required" })
    .trim()
    .min(3, { message: "Work Type must be at least three characters" })
    .max(255, { message: "More than 255 characters are not allowed" }),
  gender: z.string({ required_error: "Gender is required" }).trim(),
  startDate: z.string({ required_error: "Start Date is required" }).trim(),

  qualification: z
    .string({ required_error: "qualification is required" })
    .trim()
    .min(3, { message: "qualification must be at least three characters" })
    .max(255, { message: "More than 255 characters are not allowed" }),


});

module.exports = signupSchema;

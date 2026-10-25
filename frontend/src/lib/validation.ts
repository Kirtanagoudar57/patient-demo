import { z } from "zod";
import { GENDERS } from "../types/patient";

// --- Auth ---------------------------------------------------------------------
// The backend's UserCreate only requires non-empty strings; these rules are a
// little stricter so users get feedback before submitting.
export const loginSchema = z.object({
  username: z.string().trim().min(1, "Enter your username"),
  password: z.string().min(1, "Enter your password"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be at most 50 characters")
      .regex(/^[A-Za-z0-9_.-]+$/, "Use letters, numbers, dots, dashes or underscores"),
    email: z.string().trim().min(1, "Enter an email address").email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters"), // bcrypt only uses the first 72 bytes
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type RegisterValues = z.infer<typeof registerSchema>;

// --- Patients -----------------------------------------------------------------
// Mirrors the rules in PatientSchema (app/schemas.py).
export const patientSchema = z
  .object({
    id: z
      .number({ invalid_type_error: "Enter a patient ID" })
      .int("ID must be a whole number")
      .positive("ID must be a positive number"),
    name: z
      .string()
      .trim()
      .min(2, "Name must be 2–50 characters")
      .max(50, "Name must be 2–50 characters"),
    age: z
      .number({ invalid_type_error: "Enter an age" })
      .int("Age must be a whole number")
      .min(1, "Age must be between 1 and 120")
      .max(120, "Age must be between 1 and 120"),
    gender: z.enum(GENDERS, { errorMap: () => ({ message: "Select a gender" }) }),
    disease: z.string().trim().max(100, "Keep this under 100 characters").optional(),
    guardian_name: z.string().trim().max(50, "Keep this under 50 characters").optional(),
  })
  .superRefine((values, ctx) => {
    if (values.age < 18 && !values.guardian_name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["guardian_name"],
        message: "Guardian required for minors.",
      });
    }
  });
export type PatientFormValues = z.infer<typeof patientSchema>;

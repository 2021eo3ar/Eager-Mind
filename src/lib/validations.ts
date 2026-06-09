import { z } from "zod";

export const handleSchema = z
  .string()
  .trim()
  .min(3, "Handle must be at least 3 characters")
  .max(20, "Handle must be at most 20 characters")
  .regex(/^[A-Za-z0-9_]+$/, "Use only letters, numbers, and underscores")
  .transform((value) => value.toLowerCase());

export const signupSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  handle: handleSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const bookmarkSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Keep titles under 120 characters"),
  url: z.string().trim().url("Enter a valid URL"),
  is_public: z.coerce.boolean().default(false),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type BookmarkInput = z.infer<typeof bookmarkSchema>;

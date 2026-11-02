import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email address." }).max(254));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Enter your password." }).max(200),
  next: z.string().max(500).optional(),
});

export const forgotPasswordSchema = z.object({ email });

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, { error: "Use at least 10 characters." })
      .max(200, { error: "Use at most 200 characters." }),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    error: "The passwords do not match.",
    path: ["confirm"],
  });

const staffRole = z.enum(["super_admin", "admin", "content_editor", "booking_staff"], {
  error: "Choose a role.",
});

export const inviteStaffSchema = z.object({
  email,
  fullName: z
    .string()
    .trim()
    .min(1, { error: "Enter the person's name." })
    .max(120, { error: "Use at most 120 characters." }),
  role: staffRole,
});

export const updateStaffSchema = z.object({
  id: z.uuid(),
  role: staffRole,
  isActive: z.enum(["true", "false"]).transform((v) => v === "true"),
});

/** Flattens Zod issues into `{ field: firstMessage }` for form display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

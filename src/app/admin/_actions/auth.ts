"use server";

import { redirect } from "next/navigation";

import { safeAdminPath } from "@/lib/auth/redirects";
import { authorizeAction } from "@/lib/auth/session";
import { formValues, type FormState } from "@/lib/forms";
import { getSiteUrl } from "@/lib/site-url";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logStaffEvent } from "@/services/activity";
import {
  fieldErrors,
  forgotPasswordSchema,
  loginSchema,
  newPasswordSchema,
} from "@/lib/validation/auth";

const NOT_CONFIGURED: FormState = {
  status: "error",
  message: "Admin sign-in isn't available yet: the database has not been connected.",
};

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const raw = formValues(formData);
  const values = { email: raw.email ?? "" };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error), values };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Same message for unknown email and wrong password (no account enumeration).
    const message =
      error.status === 429
        ? "Too many attempts. Please wait a few minutes and try again."
        : !error.status || error.status >= 500
          ? "Sign-in is temporarily unavailable. Please try again shortly."
          : "Email or password is incorrect.";
    return { status: "error", message, values };
  }

  await logStaffEvent("signed_in");
  redirect(safeAdminPath(parsed.data.next));
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    // Logged first, while the session is still valid.
    await logStaffEvent("signed_out");
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login?signed_out=1");
}

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const raw = formValues(formData);
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrors(parsed.error),
      values: { email: raw.email ?? "" },
    };
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: new URL("/admin/account", getSiteUrl()).toString(),
  });

  // Always the same response, whether or not the account exists.
  return {
    status: "success",
    message:
      "If that email belongs to a staff account, we've sent a link to reset the password. It expires after a short time.",
  };
}

export async function updatePassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("dashboard.view");
  if (!auth.ok) return { status: "error", message: auth.message };

  const parsed = newPasswordSchema.safeParse(formValues(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return {
      status: "error",
      message:
        error.code === "same_password"
          ? "Choose a password you haven't used here before."
          : error.code === "weak_password"
            ? "That password is too weak. Try a longer one."
            : "We couldn't update your password. Please try again.",
    };
  }
  await logStaffEvent("password_changed");
  return { status: "success", message: "Your password has been updated." };
}

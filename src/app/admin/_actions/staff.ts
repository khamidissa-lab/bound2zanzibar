"use server";

import { revalidatePath } from "next/cache";

import { authorizeAction } from "@/lib/auth/session";
import { formValues, type FormState } from "@/lib/forms";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fieldErrors, inviteStaffSchema, updateStaffSchema } from "@/lib/validation/auth";

/**
 * Invites a staff member by email and creates their profile.
 * Sending the invitation needs the service-role key (Supabase Admin API); the
 * profile itself is inserted as the signed-in super admin, so RLS still
 * applies to that write.
 */
export async function inviteStaff(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("staff.manage");
  if (!auth.ok) return { status: "error", message: auth.message };

  const raw = formValues(formData);
  const values = {
    email: raw.email ?? "",
    fullName: raw.fullName ?? "",
    role: raw.role ?? "",
  };
  const parsed = inviteStaffSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error), values };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      status: "error",
      message:
        "Inviting staff needs SUPABASE_SERVICE_ROLE_KEY on the server. Alternatively, add the user in the Supabase dashboard and create their profile (see docs/SUPABASE_SETUP.md).",
      values,
    };
  }

  const admin = createSupabaseAdminClient();
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    { redirectTo: new URL("/admin/account", getSiteUrl()).toString() },
  );
  if (inviteError || !invited.user) {
    return {
      status: "error",
      message:
        inviteError?.code === "email_exists"
          ? "An account with that email already exists."
          : "We couldn't send the invitation. Please try again.",
      values,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error: profileError } = await supabase.from("profiles").insert({
    id: invited.user.id,
    full_name: parsed.data.fullName,
    role: parsed.data.role,
  });
  if (profileError) {
    // Undo the half-created account so the invite can be retried cleanly.
    await admin.auth.admin.deleteUser(invited.user.id);
    return { status: "error", message: "We couldn't create the staff profile.", values };
  }

  revalidatePath("/admin/staff");
  return { status: "success", message: `Invitation sent to ${parsed.data.email}.` };
}

/** Changes a staff member's role or active status. Enforced again by RLS. */
export async function updateStaff(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("staff.manage");
  if (!auth.ok) return { status: "error", message: auth.message };

  const parsed = updateStaffSchema.safeParse(formValues(formData));
  if (!parsed.success) return { status: "error", message: "Invalid request." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role, is_active: parsed.data.isActive })
    .eq("id", parsed.data.id)
    .select("id");

  if (error) {
    return {
      status: "error",
      message: error.message.includes("cannot_remove_last_super_admin")
        ? "There must always be at least one active super admin."
        : "We couldn't save that change.",
    };
  }
  if (!data || data.length === 0) {
    return { status: "error", message: "That staff member could not be updated." };
  }

  revalidatePath("/admin/staff");
  return { status: "success", message: "Saved." };
}

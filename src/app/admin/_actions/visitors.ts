"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { authorizeAction } from "@/lib/auth/session";
import type { FormState } from "@/lib/forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LEAD_STATUSES, NOTE_KINDS } from "@/lib/visitors/admin";
import { logStaffEvent } from "@/services/activity";

/**
 * Lead management. Every change runs as the signed-in staff member, so the
 * database RLS checks the role again; nothing here contacts the visitor.
 */

const GONE = "That visitor no longer exists.";
const ok = (message: string): FormState => {
  refresh();
  return { status: "success", message };
};
const fail = (message: string): FormState => ({ status: "error", message });
const str = (formData: FormData, key: string) => {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
};

const leadSchema = z.object({
  visitorId: z.uuid(),
  // "auto" hands classification back to the automatic rules.
  status: z.enum([...LEAD_STATUSES, "auto", "none"]),
  assignedTo: z.union([z.uuid(), z.literal("")]),
});

export async function updateLead(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("visitors.view");
  if (!auth.ok) return fail(auth.message);
  const parsed = leadSchema.safeParse({
    visitorId: str(formData, "visitorId"),
    status: str(formData, "status"),
    assignedTo: str(formData, "assignedTo"),
  });
  if (!parsed.success) return fail("Please choose a status.");
  const { visitorId, status, assignedTo } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const update =
    status === "auto"
      ? { assigned_to: assignedTo || null }
      : {
          lead_status: status === "none" ? null : status,
          lead_status_manual: true,
          assigned_to: assignedTo || null,
        };
  const { data, error } = await supabase
    .from("visitors")
    .update(update)
    .eq("id", visitorId)
    .select("id");
  if (error) return fail("The lead couldn't be saved. Please try again.");
  if (!data?.length) return fail(GONE);
  if (status === "auto") {
    // Hand the status back to the automatic rules and apply them now.
    const reset = await supabase.rpc("reset_lead_status", { p_visitor_id: visitorId });
    if (reset.error) return fail("The lead couldn't be saved. Please try again.");
  }
  return ok(status === "auto" ? "Automatic status turned back on." : "Lead updated.");
}

const noteSchema = z.object({
  visitorId: z.uuid(),
  kind: z.enum(NOTE_KINDS),
  body: z
    .string()
    .trim()
    .min(1, { error: "Write a note first." })
    .max(2000, { error: "Use 2,000 characters or fewer." }),
});

export async function addLeadNote(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("visitors.view");
  if (!auth.ok) return fail(auth.message);
  const parsed = noteSchema.safeParse({
    visitorId: str(formData, "visitorId"),
    kind: str(formData, "kind"),
    body: str(formData, "body"),
  });
  if (!parsed.success)
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Please check the note.",
      values: { body: str(formData, "body"), kind: str(formData, "kind") },
    };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("lead_notes").insert({
    visitor_id: parsed.data.visitorId,
    kind: parsed.data.kind,
    body: parsed.data.body,
  });
  if (error) return fail("The note couldn't be saved. Please try again.");
  return ok("Saved to the history.");
}

export async function deleteLeadNote(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("visitors.view");
  if (!auth.ok) return fail(auth.message);
  const id = z.uuid().safeParse(str(formData, "id"));
  if (!id.success) return fail("That note no longer exists.");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lead_notes")
    .delete()
    .eq("id", id.data)
    .select("id");
  if (error || !data?.length)
    return fail("Only the author or an admin can delete this note.");
  return ok("Note deleted.");
}

const taskSchema = z.object({
  visitorId: z.uuid(),
  title: z
    .string()
    .trim()
    .min(2, { error: "Describe the follow-up." })
    .max(200, { error: "Use 200 characters or fewer." }),
  dueDate: z.union([z.iso.date({ error: "Choose a valid date." }), z.literal("")]),
  assignedTo: z.union([z.uuid(), z.literal("")]),
});

export async function addLeadTask(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("visitors.view");
  if (!auth.ok) return fail(auth.message);
  const parsed = taskSchema.safeParse({
    visitorId: str(formData, "visitorId"),
    title: str(formData, "title"),
    dueDate: str(formData, "dueDate"),
    assignedTo: str(formData, "assignedTo"),
  });
  if (!parsed.success)
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Please check the follow-up.",
      values: { title: str(formData, "title"), dueDate: str(formData, "dueDate") },
    };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("lead_tasks").insert({
    visitor_id: parsed.data.visitorId,
    title: parsed.data.title,
    due_date: parsed.data.dueDate || null,
    assigned_to: parsed.data.assignedTo || null,
  });
  if (error) return fail("The follow-up couldn't be saved. Please try again.");
  return ok("Follow-up added.");
}

export async function setLeadTaskDone(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("visitors.view");
  if (!auth.ok) return fail(auth.message);
  const id = z.uuid().safeParse(str(formData, "id"));
  if (!id.success) return fail("That follow-up no longer exists.");
  const done = str(formData, "done") === "true";
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lead_tasks")
    .update({ done_at: done ? new Date().toISOString() : null })
    .eq("id", id.data)
    .select("id");
  if (error || !data?.length) return fail("That follow-up no longer exists.");
  return ok(done ? "Marked as done." : "Reopened.");
}

export async function deleteLeadTask(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("visitors.view");
  if (!auth.ok) return fail(auth.message);
  const id = z.uuid().safeParse(str(formData, "id"));
  if (!id.success) return fail("That follow-up no longer exists.");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("lead_tasks").delete().eq("id", id.data);
  if (error) return fail("The follow-up couldn't be deleted.");
  return ok("Follow-up deleted.");
}

/** Erases a visitor's record and activity (privacy requests). Admins only. */
export async function eraseVisitor(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("visitors.delete");
  if (!auth.ok) return fail(auth.message);
  const id = z.uuid().safeParse(str(formData, "id"));
  if (!id.success) return fail(GONE);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("visitors")
    .delete()
    .eq("id", id.data)
    .select("id");
  if (error || !data?.length) return fail(GONE);
  await logStaffEvent("visitor_erased", { visitor: id.data.slice(0, 8) });
  redirect("/admin/visitors?erased=1");
}

export async function unsubscribeNewsletter(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("visitors.view");
  if (!auth.ok) return fail(auth.message);
  const id = z.uuid().safeParse(str(formData, "id"));
  if (!id.success) return fail("That subscriber no longer exists.");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("id", id.data)
    .select("id");
  if (error || !data?.length) return fail("That subscriber no longer exists.");
  return ok("Unsubscribed.");
}

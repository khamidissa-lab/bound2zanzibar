import type { Metadata } from "next";

import { AccessDenied } from "@/components/admin/admin-states";
import { requireStaffPage } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { InviteStaffForm, StaffRow, type StaffMember } from "./staff-forms";

export const metadata: Metadata = { title: "Staff" };

/** Emails live in Supabase Auth; read them only if the server key is configured. */
async function getStaffEmails(): Promise<Map<string, string>> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return new Map();
  const { data, error } = await createSupabaseAdminClient().auth.admin.listUsers({
    perPage: 200,
  });
  if (error) return new Map();
  return new Map(data.users.map((u) => [u.id, u.email ?? ""]));
}

export default async function StaffPage() {
  const { staff, allowed } = await requireStaffPage("staff.manage", "/admin/staff");
  if (!allowed) return <AccessDenied />;

  const supabase = await createSupabaseServerClient();
  const [{ data: profiles, error }, emails] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, role, is_active, created_at")
      .order("created_at"),
    getStaffEmails(),
  ]);

  const members: StaffMember[] = (profiles ?? []).map((p) => ({
    id: p.id,
    fullName: p.full_name,
    email: emails.get(p.id) ?? null,
    role: p.role,
    isActive: p.is_active,
    isSelf: p.id === staff.id,
  }));

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl">Staff</h1>
      <p className="mt-1 text-muted-foreground">
        Invite team members and choose what each person can manage.
      </p>

      <section
        aria-labelledby="invite-heading"
        className="mt-8 rounded-2xl border bg-card p-6"
      >
        <h2 id="invite-heading" className="font-display text-xl">
          Invite a team member
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          They&apos;ll receive an email to set their password.
        </p>
        <InviteStaffForm canInvite={Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)} />
      </section>

      <section aria-labelledby="team-heading" className="mt-8">
        <h2 id="team-heading" className="font-display text-xl">
          Team
        </h2>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-destructive">
            We couldn&apos;t load the staff list.
          </p>
        ) : (
          <ul className="mt-4 divide-y rounded-2xl border bg-card">
            {members.map((member) => (
              <StaffRow key={member.id} member={member} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

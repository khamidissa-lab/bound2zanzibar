import { Suspense } from "react";
import type { Metadata } from "next";

import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/auth/permissions";
import { requireStaffPage } from "@/lib/auth/session";

import { PasswordForm, SetPasswordNotice } from "./password-form";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const { staff } = await requireStaffPage("dashboard.view", "/admin/account");

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl">My account</h1>
      <Suspense fallback={null}>
        <SetPasswordNotice />
      </Suspense>

      <dl className="mt-8 grid gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Name</dt>
          <dd className="font-medium text-ocean-deep">{staff.fullName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Email</dt>
          <dd className="font-medium break-all text-ocean-deep">{staff.email}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-muted-foreground">Role</dt>
          <dd className="font-medium text-ocean-deep">{ROLE_LABELS[staff.role]}</dd>
          <dd className="text-sm text-muted-foreground">
            {ROLE_DESCRIPTIONS[staff.role]}
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">
        To change your name or role, ask a super admin.
      </p>

      <section
        aria-labelledby="password-heading"
        className="mt-10 rounded-2xl border bg-card p-6"
      >
        <h2 id="password-heading" className="font-display text-xl">
          Change password
        </h2>
        <PasswordForm />
      </section>
    </div>
  );
}

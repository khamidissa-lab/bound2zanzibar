"use client";

import { useActionState, useRef, useState } from "react";

import { inviteStaff, updateStaff } from "@/app/admin/_actions/staff";
import { Field, FormMessage, SubmitButton } from "@/components/admin/form-controls";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, type StaffRole } from "@/lib/auth/permissions";
import { initialFormState } from "@/lib/forms";

export type StaffMember = {
  id: string;
  fullName: string;
  email: string | null;
  role: StaffRole;
  isActive: boolean;
  isSelf: boolean;
};

const ROLES = Object.keys(ROLE_LABELS) as StaffRole[];

const asRole = (value: string | undefined): StaffRole | undefined =>
  ROLES.find((role) => role === value);

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-ocean-deep";

function RoleSelect({
  id,
  name,
  defaultValue,
  error,
}: {
  id: string;
  name: string;
  defaultValue?: StaffRole;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>Role</Label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        aria-invalid={error ? true : undefined}
        className={selectClass}
      >
        {!defaultValue ? (
          <option value="" disabled>
            Choose a role…
          </option>
        ) : null}
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]} — {ROLE_DESCRIPTIONS[role]}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function InviteStaffForm({ canInvite }: { canInvite: boolean }) {
  const [state, action] = useActionState(inviteStaff, initialFormState);
  return (
    <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2">
        <FormMessage state={state} />
        {!canInvite ? (
          <p className="rounded-lg border border-dashed border-gold bg-gold/10 px-3 py-2.5 text-sm text-ocean-deep">
            Email invitations need the server-only <code>SUPABASE_SERVICE_ROLE_KEY</code>.
            Until it is set, add staff in the Supabase dashboard (see
            docs/SUPABASE_SETUP.md).
          </p>
        ) : null}
      </div>
      <Field
        label="Full name"
        name="fullName"
        defaultValue={state.values?.fullName}
        autoComplete="off"
        required
        error={state.fieldErrors?.fullName}
      />
      <Field
        label="Email"
        name="email"
        defaultValue={state.values?.email}
        type="email"
        autoComplete="off"
        required
        error={state.fieldErrors?.email}
      />
      <div className="sm:col-span-2">
        <RoleSelect
          id="invite-role"
          name="role"
          defaultValue={asRole(state.values?.role)}
          error={state.fieldErrors?.role}
        />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton pendingLabel="Sending invitation…">Send invitation</SubmitButton>
      </div>
    </form>
  );
}

export function StaffRow({ member }: { member: StaffMember }) {
  const [state, action] = useActionState(updateStaff, initialFormState);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const toggleFormRef = useRef<HTMLFormElement>(null);

  return (
    <li className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ocean-deep">
            {member.fullName}
            {member.isSelf ? (
              <span className="ml-2 text-xs text-muted-foreground">(you)</span>
            ) : null}
          </p>
          <p className="text-sm break-all text-muted-foreground">
            {member.email ?? "Email hidden (server key not configured)"}
          </p>
        </div>
        <span
          className={
            member.isActive
              ? "rounded-full bg-turquoise-soft px-2.5 py-0.5 text-xs font-medium text-ocean-deep"
              : "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
          }
        >
          {member.isActive ? "Active" : "Deactivated"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <form action={action} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <input type="hidden" name="id" value={member.id} />
          <input type="hidden" name="isActive" value={String(member.isActive)} />
          <RoleSelect id={`role-${member.id}`} name="role" defaultValue={member.role} />
          <SubmitButton pendingLabel="Saving…" variant="outline">
            Save role
          </SubmitButton>
        </form>

        <form ref={toggleFormRef} action={action}>
          <input type="hidden" name="id" value={member.id} />
          <input type="hidden" name="role" value={member.role} />
          <input type="hidden" name="isActive" value={String(!member.isActive)} />
          {member.isActive ? (
            <Button
              type="button"
              variant="destructive"
              size="lg"
              onClick={() => setConfirmOpen(true)}
            >
              Deactivate
            </Button>
          ) : (
            <SubmitButton pendingLabel="Reactivating…" variant="outline">
              Reactivate
            </SubmitButton>
          )}
        </form>
      </div>
      <div className="mt-3">
        <FormMessage state={state} />
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {member.fullName}?</AlertDialogTitle>
            <AlertDialogDescription>
              They will immediately lose access to the admin area. You can reactivate them
              later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false);
                toggleFormRef.current?.requestSubmit();
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

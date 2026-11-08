"use client";

import { useActionState, useEffect, useRef } from "react";
import { Check, RotateCcw, Trash2 } from "lucide-react";

import {
  addLeadNote,
  addLeadTask,
  deleteLeadNote,
  deleteLeadTask,
  eraseVisitor,
  setLeadTaskDone,
  updateLead,
} from "@/app/admin/_actions/visitors";
import { FormMessage } from "@/components/admin/form-controls";
import { Button } from "@/components/ui/button";
import { initialFormState } from "@/lib/forms";
import { cn } from "@/lib/utils";
import {
  LEAD_DESCRIPTIONS,
  LEAD_LABELS,
  LEAD_STATUSES,
  NOTE_KIND_LABELS,
  NOTE_KINDS,
  type LeadStatus,
} from "@/lib/visitors/admin";

const field =
  "h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:border-turquoise-deep focus-visible:ring-2 focus-visible:ring-turquoise-deep/25";
const label = "mb-1 block text-xs font-medium text-muted-foreground";

type Assignee = { id: string; full_name: string };

export function LeadStatusForm({
  visitorId,
  status,
  manual,
  assignedTo,
  assignees,
}: {
  visitorId: string;
  status: LeadStatus | null;
  manual: boolean;
  assignedTo: string | null;
  assignees: Assignee[];
}) {
  const [state, action, pending] = useActionState(updateLead, initialFormState);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="visitorId" value={visitorId} />
      <div>
        <label htmlFor="lead-status" className={label}>
          Lead stage
        </label>
        <select
          id="lead-status"
          name="status"
          defaultValue={manual ? (status ?? "none") : "auto"}
          className={field}
        >
          <option value="auto">
            Automatic{!manual && status ? ` (now: ${LEAD_LABELS[status]})` : ""}
          </option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LEAD_LABELS[s]}
            </option>
          ))}
          <option value="none">Not a lead</option>
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          {manual
            ? "Set by staff. Choose Automatic to let the website classify this visitor again."
            : status
              ? LEAD_DESCRIPTIONS[status]
              : "Updated automatically from what the visitor does on the website."}
        </p>
      </div>
      <div>
        <label htmlFor="lead-assignee" className={label}>
          Follow-up by
        </label>
        <select
          id="lead-assignee"
          name="assignedTo"
          defaultValue={assignedTo ?? ""}
          className={field}
        >
          <option value="">Nobody yet</option>
          {assignees.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name}
            </option>
          ))}
        </select>
      </div>
      <FormMessage state={state} />
      <Button type="submit" size="sm" disabled={pending}>
        Save lead
      </Button>
    </form>
  );
}

/** Clears a form after a successful save. */
function useResetOnSuccess(status: string) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (status === "success") ref.current?.reset();
  }, [status]);
  return ref;
}

export function NoteForm({ visitorId }: { visitorId: string }) {
  const [state, action, pending] = useActionState(addLeadNote, initialFormState);
  const ref = useResetOnSuccess(state.status);
  return (
    <form ref={ref} action={action} className="space-y-2">
      <input type="hidden" name="visitorId" value={visitorId} />
      <div className="grid gap-2 sm:grid-cols-[10rem_1fr]">
        <div>
          <label htmlFor="note-kind" className={label}>
            Type
          </label>
          <select
            id="note-kind"
            name="kind"
            defaultValue={state.values?.kind ?? "note"}
            className={field}
          >
            {NOTE_KINDS.map((k) => (
              <option key={k} value={k}>
                {NOTE_KIND_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="note-body" className={label}>
            Note or summary of the conversation
          </label>
          <textarea
            id="note-body"
            name="body"
            rows={2}
            maxLength={2000}
            defaultValue={state.status === "error" ? state.values?.body : undefined}
            className={cn(field, "h-auto py-2")}
          />
        </div>
      </div>
      <FormMessage state={state} />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        Add to history
      </Button>
    </form>
  );
}

export function DeleteNoteButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deleteLeadNote, initialFormState);
  return (
    <form
      action={action}
      onSubmit={(e) => !window.confirm("Delete this note?") && e.preventDefault()}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        size="icon-sm"
        variant="ghost"
        disabled={pending}
        aria-label="Delete note"
      >
        <Trash2 aria-hidden="true" />
      </Button>
      {state.status === "error" ? <FormMessage state={state} /> : null}
    </form>
  );
}

export function TaskForm({
  visitorId,
  assignees,
}: {
  visitorId: string;
  assignees: Assignee[];
}) {
  const [state, action, pending] = useActionState(addLeadTask, initialFormState);
  const ref = useResetOnSuccess(state.status);
  return (
    <form ref={ref} action={action} className="space-y-2">
      <input type="hidden" name="visitorId" value={visitorId} />
      <div>
        <label htmlFor="task-title" className={label}>
          Follow-up
        </label>
        <input
          id="task-title"
          name="title"
          maxLength={200}
          placeholder="e.g. Send safari quote by email"
          defaultValue={state.status === "error" ? state.values?.title : undefined}
          className={field}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="task-due" className={label}>
            Due
          </label>
          <input id="task-due" name="dueDate" type="date" className={field} />
        </div>
        <div>
          <label htmlFor="task-assignee" className={label}>
            Assigned to
          </label>
          <select id="task-assignee" name="assignedTo" className={field}>
            <option value="">Anyone</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <FormMessage state={state} />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        Add follow-up
      </Button>
    </form>
  );
}

export function TaskActions({ id, done }: { id: string; done: boolean }) {
  const [toggled, toggle, toggling] = useActionState(setLeadTaskDone, initialFormState);
  const [removed, remove, removing] = useActionState(deleteLeadTask, initialFormState);
  return (
    <div className="flex shrink-0 items-center gap-1">
      <form action={toggle}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="done" value={done ? "false" : "true"} />
        <Button
          type="submit"
          size="sm"
          variant={done ? "ghost" : "outline"}
          disabled={toggling}
        >
          {done ? (
            <RotateCcw aria-hidden="true" data-icon="inline-start" />
          ) : (
            <Check aria-hidden="true" data-icon="inline-start" />
          )}
          {done ? "Reopen" : "Done"}
        </Button>
      </form>
      <form
        action={remove}
        onSubmit={(e) => !window.confirm("Delete this follow-up?") && e.preventDefault()}
      >
        <input type="hidden" name="id" value={id} />
        <Button
          type="submit"
          size="icon-sm"
          variant="ghost"
          disabled={removing}
          aria-label="Delete follow-up"
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </form>
      {toggled.status === "error" ? <FormMessage state={toggled} /> : null}
      {removed.status === "error" ? <FormMessage state={removed} /> : null}
    </div>
  );
}

export function EraseVisitorButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(eraseVisitor, initialFormState);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            "Erase this visitor's record, activity, notes and follow-ups permanently? Their bookings and enquiries are kept.",
          )
        )
          e.preventDefault();
      }}
      className="space-y-2"
    >
      <input type="hidden" name="id" value={id} />
      <FormMessage state={state} />
      <Button
        type="submit"
        size="sm"
        variant="outline"
        disabled={pending}
        className="text-destructive"
      >
        <Trash2 aria-hidden="true" data-icon="inline-start" />
        Erase visitor record
      </Button>
    </form>
  );
}

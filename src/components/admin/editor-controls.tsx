"use client";

import {
  startTransition,
  type ComponentProps,
  type FormEvent,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Form for long admin editors. Submits through a transition instead of a form
 * action so React does not reset the fields afterwards — a validation error
 * never wipes unsaved edits. Pair with `useActionState` and <SaveButton>.
 */
export function EditorForm({
  action,
  children,
  className,
}: {
  action: (formData: FormData) => void;
  children: ReactNode;
  className?: string;
}) {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => action(formData));
  };
  return (
    <form onSubmit={onSubmit} noValidate className={className}>
      {children}
    </form>
  );
}

export function SaveButton({
  pending,
  children = "Save",
  pendingLabel = "Saving…",
  variant,
  className,
}: {
  pending: boolean;
  children?: ReactNode;
  pendingLabel?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  className?: string;
}) {
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      variant={variant}
      className={className}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin" aria-hidden="true" data-icon="inline-start" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

const controlClass =
  "w-full rounded-lg border border-input bg-background px-3 text-sm text-ocean-deep outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive";

function FieldShell({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: ReactNode) =>
  [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") ||
  undefined;

type BaseProps = {
  name: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
};

export function TextField({
  id: idProp,
  name,
  label,
  error,
  hint,
  className,
  ...props
}: BaseProps & Omit<ComponentProps<"input">, "name">) {
  const id = idProp ?? `f-${name}`;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={className}>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(controlClass, "h-11")}
        {...props}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  id: idProp,
  name,
  label,
  error,
  hint,
  className,
  rows = 4,
  ...props
}: BaseProps & Omit<ComponentProps<"textarea">, "name">) {
  const id = idProp ?? `f-${name}`;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={className}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(controlClass, "py-2.5 leading-relaxed")}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  id: idProp,
  name,
  label,
  error,
  hint,
  className,
  options,
  placeholder,
  ...props
}: BaseProps &
  Omit<ComponentProps<"select">, "name"> & {
    options: { value: string; label: string }[];
    placeholder?: string;
  }) {
  const id = idProp ?? `f-${name}`;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={className}>
      <select
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(controlClass, "h-11")}
        {...props}
      >
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  id: idProp,
  name,
  label,
  hint,
  defaultChecked,
  value,
}: {
  id?: string;
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
  value?: string;
}) {
  const id = idProp ?? `f-${name}${value ? `-${value}` : ""}`;
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 accent-[var(--brand-turquoise-deep)]"
      />
      <div>
        <label htmlFor={id} className="text-sm font-medium text-ocean-deep">
          {label}
        </label>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

/** Groups related fields under a heading. */
export function FieldSet({
  legend,
  description,
  children,
  className,
}: {
  legend: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("rounded-2xl border bg-card p-5 sm:p-6", className)}>
      <legend className="sr-only">{legend}</legend>
      <h2 className="font-display text-xl" aria-hidden="true">
        {legend}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

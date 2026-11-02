"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CircleAlert, CircleCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "@/lib/forms";
import { cn } from "@/lib/utils";

type FieldProps = ComponentProps<typeof Input> & {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
};

export function Field({
  label,
  name,
  error,
  hint,
  id,
  className,
  ...inputProps
}: FieldProps) {
  const fieldId = id ?? `field-${name}`;
  const describedBy = [error ? `${fieldId}-error` : null, hint ? `${fieldId}-hint` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="h-11 bg-background"
        {...inputProps}
      />
      {hint ? (
        <p id={`${fieldId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${fieldId}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SubmitButton({
  children,
  pendingLabel,
  className,
  variant,
}: {
  children: ReactNode;
  pendingLabel: string;
  className?: string;
  variant?: ComponentProps<typeof Button>["variant"];
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      variant={variant}
      disabled={pending}
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

export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  const success = state.status === "success";
  const Icon = success ? CircleCheck : CircleAlert;
  return (
    <p
      role={success ? "status" : "alert"}
      className={cn(
        "flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm",
        success
          ? "bg-turquoise-soft text-ocean-deep"
          : "bg-destructive/10 text-destructive",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {state.message}
    </p>
  );
}

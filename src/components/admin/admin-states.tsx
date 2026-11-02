import Link from "next/link";
import { Hammer, ShieldX } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

/** Shown when a signed-in staff member opens a section their role can't use. */
export function AccessDenied() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border bg-card px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldX className="size-5" aria-hidden="true" />
      </span>
      <h1 className="mt-4 font-display text-2xl">
        You don&apos;t have access to this section
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your role doesn&apos;t include this area. If you need access, ask a super admin to
        change your role.
      </p>
      <Link
        href="/admin"
        className={buttonVariants({ variant: "outline", className: "mt-6" })}
      >
        Back to dashboard
      </Link>
    </div>
  );
}

/** Honest placeholder for admin sections scheduled for a later phase. */
export function AdminComingSoon({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-dashed border-gold bg-card p-6">
        <Hammer className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
        <div>
          <p className="font-medium text-ocean-deep">Coming in {phase}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Access to this section is already restricted to the right roles. The tools to
            manage it are built in {phase}.
          </p>
        </div>
      </div>
    </div>
  );
}

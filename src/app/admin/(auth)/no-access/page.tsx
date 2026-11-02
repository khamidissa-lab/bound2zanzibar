import type { Metadata } from "next";
import { ShieldX } from "lucide-react";

import { signOut } from "@/app/admin/_actions/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "No access" };

export default function NoAccessPage() {
  return (
    <div className="text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldX className="size-5" aria-hidden="true" />
      </span>
      <h1 className="mt-4 font-display text-2xl">No staff access</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You&apos;re signed in, but this account doesn&apos;t have an active staff role. If
        you think this is a mistake, contact a super admin.
      </p>
      <form action={signOut} className="mt-6">
        <Button type="submit" variant="outline" size="lg" className="w-full">
          Sign out
        </Button>
      </form>
    </div>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";

import { isSupabaseConfigured } from "@/lib/supabase/env";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  return (
    <>
      <h1 className="font-display text-2xl">Staff sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        For Bound to Zanzibar team members only.
      </p>
      {!configured ? (
        <p
          role="status"
          className="mt-6 rounded-lg border border-dashed border-gold bg-gold/10 px-3 py-2.5 text-sm text-ocean-deep"
        >
          The admin database isn&apos;t connected yet, so sign-in is unavailable. See
          docs/SUPABASE_SETUP.md.
        </p>
      ) : null}
      <Suspense
        fallback={
          <div
            className="mt-6 h-64 animate-pulse rounded-xl bg-muted"
            aria-hidden="true"
          />
        }
      >
        <LoginForm disabled={!configured} />
      </Suspense>
    </>
  );
}

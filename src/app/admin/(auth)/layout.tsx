import type { ReactNode } from "react";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-tide flex flex-1 flex-col items-center justify-center px-5 py-16">
      <Logo variant="full" size={150} priority className="mb-6 shadow-card" />
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-card sm:p-8">
        {children}
      </div>
      <Link href="/" className="mt-6 text-sm text-muted-foreground hover:text-ocean-deep">
        ← Back to the website
      </Link>
    </main>
  );
}

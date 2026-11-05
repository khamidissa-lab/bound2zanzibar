import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="admin-scope grid flex-1 bg-background lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel (decorative), large screens only. */}
      <div className="relative hidden overflow-hidden bg-ocean-deep lg:block">
        <Image
          src="/hero/nungwi-golden-hour-dhow.jpg"
          alt=""
          fill
          priority
          sizes="55vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep via-ocean-deep/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="text-xs font-semibold tracking-[0.2em] text-gold-light uppercase">
            Staff area
          </p>
          <p className="mt-3 max-w-md text-3xl leading-tight font-semibold">
            {siteConfig.name} admin
          </p>
          <p className="mt-2 max-w-sm text-sm text-white/75">
            Tours, packages, prices, bookings and enquiries in one place.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center px-5 py-16">
        <div className="mb-8 rounded-xl bg-white p-2 shadow-card">
          <Logo variant="full" size={96} priority />
        </div>
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-card sm:p-8">
          {children}
        </div>
        <Link
          href="/"
          className="mt-6 text-sm text-muted-foreground hover:text-ocean-deep"
        >
          ← Back to the website
        </Link>
      </div>
    </main>
  );
}

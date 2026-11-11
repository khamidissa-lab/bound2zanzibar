import type { Metadata } from "next";
import Link from "next/link";

import { AccessDenied } from "@/components/admin/admin-states";
import { contact, socialLinks } from "@/config/site";
import { requireStaffPage } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { CurrencyForm, type CurrencyRow } from "./currency-form";

export const metadata: Metadata = { title: "Site settings" };

async function loadCurrencies(): Promise<CurrencyRow[]> {
  const supabase = await createSupabaseServerClient();
  const [currencies, tours, packages, options] = await Promise.all([
    supabase
      .from("currencies")
      .select("code, name, is_active, sort_order")
      .order("sort_order")
      .order("code"),
    supabase.from("tour_prices").select("currency").eq("is_active", true),
    supabase.from("package_prices").select("currency").eq("is_active", true),
    supabase.from("tour_option_prices").select("currency"),
  ]);
  if (currencies.error || tours.error || packages.error || options.error) {
    const error = currencies.error ?? tours.error ?? packages.error ?? options.error;
    console.error(`[settings] failed to load currencies: ${error?.message ?? ""}`);
    throw new Error("Failed to load currencies");
  }
  const used = new Map<string, number>();
  for (const p of [...tours.data, ...packages.data, ...options.data]) {
    used.set(p.currency, (used.get(p.currency) ?? 0) + 1);
  }
  return currencies.data.map((c) => ({ ...c, prices: used.get(c.code) ?? 0 }));
}

export default async function SettingsPage() {
  const { allowed } = await requireStaffPage("settings.manage", "/admin/settings");
  if (!allowed) return <AccessDenied />;
  const currencies = await loadCurrencies();

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="font-display text-3xl">Site settings</h1>
        <p className="text-muted-foreground">
          Currencies used for prices and booking requests, and the contact details shown
          on the website.
        </p>
      </div>

      <section aria-labelledby="currencies-title" className="space-y-4">
        <div>
          <h2 id="currencies-title" className="font-display text-2xl">
            Currencies
          </h2>
          <p className="text-sm text-muted-foreground">
            Each price is entered in its own currency and is never converted. Adding a
            currency here lets you enter prices in it on any tour or package; check them
            on the{" "}
            <Link href="/admin/pricing" className="text-turquoise-deep underline">
              Pricing
            </Link>{" "}
            page. The website&apos;s price switcher still shows US dollars for
            international visitors and shillings for residents.
          </p>
        </div>
        <ul className="space-y-4">
          {currencies.map((c) => (
            <li key={c.code}>
              <CurrencyForm currency={c} />
            </li>
          ))}
        </ul>
        <h3 className="pt-2 font-sans text-base font-semibold">Add a currency</h3>
        <CurrencyForm currency={null} />
      </section>

      <section aria-labelledby="contact-title" className="space-y-3">
        <h2 id="contact-title" className="font-display text-2xl">
          Contact details on the website
        </h2>
        <dl className="divide-y rounded-xl border bg-card text-sm">
          {[
            ["Email", contact.email],
            ["Booking email", contact.bookingEmail],
            ["Phone and WhatsApp", contact.phoneDisplay],
            ...socialLinks.map((s) => [s.label, s.handle ?? "Not added yet"]),
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium text-ocean-deep">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-muted-foreground">
          These are set in the website code (src/config/site.ts). Ask your developer to
          change them.
        </p>
      </section>
    </div>
  );
}

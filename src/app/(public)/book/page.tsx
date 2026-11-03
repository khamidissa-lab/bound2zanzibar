import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Info, Mail, MessageCircle, Phone } from "lucide-react";

import { BookingForm, type BookableItem } from "@/components/booking/booking-form";
import { PageHeader } from "@/components/shared/page-header";
import { contact, enquiryMailto, whatsappLink } from "@/config/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { zanzibarDate } from "@/services/admin-dashboard-model";
import { getPackages, getTours } from "@/services/content";

export const metadata: Metadata = {
  title: "Book a Trip",
  description:
    "Send a booking request for a Zanzibar tour, safari or package. Our team confirms availability and the final price with you.",
};

const steps = [
  "Choose a tour or package and send your preferred date and group size.",
  "You get a reference number straight away.",
  "Our team checks availability and replies with the details and final price.",
  "Your booking is confirmed only once our team confirms it in writing.",
];

export default function BookPage({ searchParams }: PageProps<"/book">) {
  return (
    <>
      <PageHeader
        eyebrow="Booking"
        title="Request a booking"
        description="Tell us what you'd like to do and when. This is a request — nothing is booked or charged until our team confirms it with you."
        crumbs={[{ label: "Home", href: "/" }, { label: "Book" }]}
      />

      <section className="container-page grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-16">
        <div className="min-w-0 rounded-2xl border bg-card p-5 shadow-card sm:p-8">
          <Suspense
            fallback={<p className="text-muted-foreground">Loading the booking form…</p>}
          >
            <BookingSection searchParams={searchParams} />
          </Suspense>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-sand-soft p-6">
            <h2 className="font-display text-xl">How booking works</h2>
            <ol className="mt-4 space-y-3">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ocean-deep text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border p-6 text-sm">
            <h2 className="font-display text-xl">Prefer to talk?</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={enquiryMailto("Booking enquiry")}
                  className="inline-flex items-center gap-2 text-turquoise-deep hover:underline"
                >
                  <Mail className="size-4" aria-hidden="true" />
                  {contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contact.phone}`}
                  className="inline-flex items-center gap-2 text-turquoise-deep hover:underline"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink("Hello! I'd like help booking a trip.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-turquoise-deep hover:underline"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  WhatsApp {contact.phoneDisplay}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

async function BookingSection({
  searchParams,
}: {
  searchParams: PageProps<"/book">["searchParams"];
}) {
  await connection();
  const params = await searchParams;
  const [tours, packages] = await Promise.all([getTours(), getPackages()]);

  const items: BookableItem[] = [
    ...tours.map((t) => ({
      value: `tour:${t.slug}`,
      label: `${t.name} · ${t.duration}`,
      group: "Tours" as const,
      prices: t.prices,
    })),
    ...packages.map((p) => ({
      value: `package:${p.slug}`,
      label: `${p.name} · ${p.days} days`,
      group: "Packages" as const,
      prices: p.prices,
    })),
  ];
  const requested = params.package
    ? `package:${first(params.package)}`
    : `tour:${first(params.tour)}`;
  const defaultItem = items.some((i) => i.value === requested) ? requested : "";
  const available = isSupabaseConfigured();

  return (
    <>
      {!available ? (
        <p
          role="note"
          className="mb-6 flex items-start gap-2 rounded-xl border border-dashed border-gold bg-gold/10 px-4 py-3 text-sm text-ocean-deep"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden="true" />
          Online booking requests open soon. Until then, please email {contact.email} or
          call {contact.phoneDisplay}.
        </p>
      ) : null}
      <BookingForm
        key={defaultItem}
        items={items}
        defaultItem={defaultItem}
        today={zanzibarDate(new Date())}
        available={available}
      />
    </>
  );
}

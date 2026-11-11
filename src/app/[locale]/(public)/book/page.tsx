import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Info, Mail, MessageCircle, Phone } from "lucide-react";

import { BookingForm, type BookableItem } from "@/components/booking/booking-form";
import { isTravellerType } from "@/config/travellers";
import { PageHeader } from "@/components/shared/page-header";
import { contact, enquiryMailto, whatsappLink } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { localeAlternates, pageLocale } from "@/i18n/seo";
import { getI18n } from "@/i18n/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { tripPlanFromParams, tripPlanQuery } from "@/lib/trip-plan";
import { zanzibarDate } from "@/services/admin-dashboard-model";
import { getPackages, getTours } from "@/services/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/book">): Promise<Metadata> {
  const locale = pageLocale((await params).locale);
  const { t } = getI18n(locale);
  return {
    title: t.book.metaTitle,
    description: t.book.metaDescription,
    alternates: localeAlternates(locale, "/book"),
  };
}

export default async function BookPage({
  params,
  searchParams,
}: PageProps<"/[locale]/book">) {
  const locale = pageLocale((await params).locale);
  const { t, fmt } = getI18n(locale);
  const b = t.book;
  return (
    <>
      <PageHeader
        eyebrow={b.eyebrow}
        title={b.title}
        description={b.description}
        crumbs={[{ label: t.nav.home, href: "/" }, { label: t.nav.bookNow }]}
        tone="sand"
      />

      <section className="container-page grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16 lg:py-20">
        <div className="min-w-0 border border-ocean-deep/15 bg-ivory p-5 shadow-card sm:p-10">
          <Suspense fallback={<p className="text-muted-foreground">{b.loadingForm}</p>}>
            <BookingSection searchParams={searchParams} locale={locale} />
          </Suspense>
        </div>

        <div className="space-y-8 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
          <div className="bg-ocean-deep p-7 text-ivory">
            <h2 className="font-display text-3xl text-ivory">{b.howTitle}</h2>
            <ol className="mt-6 space-y-5">
              {b.steps.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-4 text-sm leading-relaxed text-white/85"
                >
                  <span className="font-display text-2xl leading-none text-gold-light italic">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="border-t border-ocean-deep/15 pt-6 text-sm">
            <h2 className="font-display text-2xl">{b.talkTitle}</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={enquiryMailto(b.emailSubject, contact.bookingEmail)}
                  className="inline-flex items-center gap-2 text-turquoise-deep hover:underline"
                >
                  <Mail className="size-4" aria-hidden="true" />
                  {contact.bookingEmail}
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
                  href={whatsappLink(b.whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-turquoise-deep hover:underline"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {fmt(b.whatsappLabel, { phone: contact.phoneDisplay })}
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
  locale,
}: {
  searchParams: PageProps<"/[locale]/book">["searchParams"];
  locale: Locale;
}) {
  const { t, fmt } = getI18n(locale);
  await connection();
  const params = await searchParams;
  const [tours, packages] = await Promise.all([
    getTours({}, locale),
    getPackages({}, locale),
  ]);

  const items: BookableItem[] = [
    ...tours.map((t) => ({
      value: `tour:${t.slug}`,
      label: `${t.name} · ${t.duration}`,
      group: "Tours" as const,
      prices: t.prices,
      options: t.options,
    })),
    ...packages.map((p) => ({
      value: `package:${p.slug}`,
      label: `${p.name} · ${fmt(t.bookingForm.daysSuffix, { days: p.days })}`,
      group: "Packages" as const,
      prices: p.prices,
    })),
  ];
  const requested = params.package
    ? `package:${first(params.package)}`
    : `tour:${first(params.tour)}`;
  const defaultItem = items.some((i) => i.value === requested) ? requested : "";
  // From the homepage traveller boxes: start the message with who is coming.
  const trip = first(params.trip);
  const defaultMessage = isTravellerType(trip) ? t.book.tripNotes[trip] : undefined;
  // Date and group size from the tour search; a past date is dropped.
  const today = zanzibarDate(new Date());
  const plan = tripPlanFromParams((key) => first(params[key]) || null);
  if (plan.date && plan.date < today) plan.date = "";
  const available = isSupabaseConfigured();

  return (
    <>
      {!available ? (
        <p
          role="note"
          className="mb-6 flex items-start gap-2 border-s-2 border-gold bg-gold/10 px-4 py-3 text-sm text-ocean-deep"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden="true" />
          {fmt(t.book.unavailable, {
            email: contact.bookingEmail,
            phone: contact.phoneDisplay,
          })}
        </p>
      ) : null}
      <BookingForm
        key={`${defaultItem}|${trip}|${tripPlanQuery(plan)}`}
        items={items}
        defaultItem={defaultItem}
        defaultMessage={defaultMessage}
        plan={plan}
        today={today}
        available={available}
      />
    </>
  );
}

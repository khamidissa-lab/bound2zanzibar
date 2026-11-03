import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, Mail, MessageCircle, Phone } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { contact, whatsappLink } from "@/config/site";
import { BOOKING_REFERENCE_RE } from "@/lib/booking/request";

export const metadata: Metadata = {
  title: "Booking request received",
  robots: { index: false, follow: false },
};

/**
 * Shown after a request is saved. The reference comes from the URL and is only
 * echoed back (when it has the right format) — nothing is looked up, so this
 * page can never reveal another customer's booking.
 */
export default function BookingReceivedPage({
  searchParams,
}: PageProps<"/book/received">) {
  return (
    <section className="container-page flex justify-center py-16 sm:py-24">
      <div className="w-full max-w-xl rounded-3xl border bg-card p-6 text-center shadow-card sm:p-10">
        <CircleCheck className="mx-auto size-12 text-turquoise-deep" aria-hidden="true" />
        <h1 className="mt-4 font-display text-3xl text-ocean-deep sm:text-4xl">
          Request received
        </h1>
        <p className="mt-3 text-muted-foreground">
          Thank you! Your booking request is{" "}
          <strong className="text-ocean-deep">pending</strong> — it is not confirmed yet.
          Our team will contact you to confirm availability and the final price.
        </p>

        <Suspense fallback={null}>
          <Reference searchParams={searchParams} />
        </Suspense>

        <div className="mt-8 space-y-2 text-left text-sm">
          <p className="font-medium text-ocean-deep">What happens next</p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Our team replies by email or phone using the details you gave.</li>
            <li>
              No payment has been taken. We&apos;ll explain how to pay once confirmed.
            </li>
            <li>Need to change something? Contact us and quote your reference.</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-2 text-sm sm:flex-row sm:gap-6">
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex items-center justify-center gap-2 text-turquoise-deep hover:underline"
          >
            <Mail className="size-4" aria-hidden="true" />
            {contact.email}
          </a>
          <a
            href={`tel:${contact.phone}`}
            className="inline-flex items-center justify-center gap-2 text-turquoise-deep hover:underline"
          >
            <Phone className="size-4" aria-hidden="true" />
            {contact.phoneDisplay}
          </a>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/tours" className={buttonVariants({ variant: "outline" })}>
            Browse more tours
          </Link>
          <Link href="/" className={buttonVariants()}>
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}

async function Reference({
  searchParams,
}: {
  searchParams: PageProps<"/book/received">["searchParams"];
}) {
  const raw = (await searchParams).ref;
  const ref = Array.isArray(raw) ? raw[0] : raw;
  if (!ref || !BOOKING_REFERENCE_RE.test(ref)) return null;
  return (
    <div className="mt-6 rounded-2xl bg-turquoise-soft px-4 py-4">
      <p className="text-xs font-medium tracking-wide text-ocean-deep/70 uppercase">
        Your reference
      </p>
      <p className="mt-1 font-mono text-2xl font-semibold tracking-wider text-ocean-deep">
        {ref}
      </p>
      <p className="mt-1 text-xs text-ocean-deep/70">Keep this for any questions.</p>
      <a
        href={whatsappLink(`Hello! My booking request reference is ${ref}.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-turquoise-deep hover:underline"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        Message us on WhatsApp about this request
      </a>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { contact, enquiryMailto } from "@/config/site";

export const metadata: Metadata = {
  title: "Book a Trip",
  description: "Send us a booking enquiry for a Zanzibar tour, safari or package.",
};

const steps = [
  "Choose a tour or package that interests you.",
  "Send us your preferred dates, number of adults and children, and any questions.",
  "We check availability and confirm the details and final price with you.",
  "Your booking is confirmed only once our team confirms it in writing.",
];

export default function BookPage() {
  return (
    <>
      <PageHeader
        eyebrow="Booking"
        title="Book a trip"
        description="Online booking requests are coming soon. In the meantime, our team is happy to arrange your trip by email or phone."
        crumbs={[{ label: "Home", href: "/" }, { label: "Book" }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={enquiryMailto("Booking enquiry")}
            className={buttonVariants({ size: "lg" })}
          >
            <Mail aria-hidden="true" data-icon="inline-start" />
            Email {contact.email}
          </a>
          <a
            href={`tel:${contact.phone}`}
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            <Phone aria-hidden="true" data-icon="inline-start" />
            Call {contact.phoneDisplay}
          </a>
        </div>
      </PageHeader>

      <section className="container-page grid gap-12 py-16 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-medium">How booking works</h2>
          <ol className="mt-6 space-y-4">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ocean-deep text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="pt-1 text-lg">{step}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-2xl bg-sand-soft p-8">
          <h2 className="text-2xl font-medium">Not sure yet?</h2>
          <p className="mt-2 text-muted-foreground">
            Browse our experiences and packages, then get in touch with the ones you like.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/tours" className={buttonVariants()}>
              Zanzibar tours
            </Link>
            <Link href="/packages" className={buttonVariants({ variant: "outline" })}>
              Packages
            </Link>
            <Link href="/safari" className={buttonVariants({ variant: "outline" })}>
              Safari
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

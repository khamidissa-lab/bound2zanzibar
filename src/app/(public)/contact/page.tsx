import type { Metadata } from "next";
import Link from "next/link";
import { AtSign, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { EnquiryForm } from "@/components/contact/enquiry-form";
import { PageHeader } from "@/components/shared/page-header";
import {
  contact,
  enquiryMailto,
  siteConfig,
  socialLinks,
  whatsappLink,
} from "@/config/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact ${siteConfig.name} to plan a Zanzibar tour, safari or travel package.`,
};

const instagram = socialLinks.find((s) => s.label === "Instagram");

export default function ContactPage() {
  const channels = [
    {
      icon: Mail,
      title: "Email",
      detail: contact.email,
      href: enquiryMailto("Trip enquiry"),
      note: "Tell us your dates, group size and what you would like to do.",
    },
    {
      icon: Phone,
      title: "Phone",
      detail: contact.phoneDisplay,
      href: `tel:${contact.phone}`,
      note: "Call us to talk through your plans.",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      detail: contact.phoneDisplay,
      href: whatsappLink("Hello! I'd like to ask about a trip."),
      note: "Send us a message on WhatsApp.",
    },
    ...(instagram?.href && instagram.handle
      ? [
          {
            icon: AtSign,
            title: "Instagram",
            detail: instagram.handle,
            href: instagram.href,
            note: "Follow along and send us a message.",
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Contact us"
        description="Questions about a tour, package or safari? Reach out and our team will get back to you."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="container-page py-16">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map(({ icon: Icon, title, detail, href, note }) => (
            <li key={title}>
              <a
                href={href}
                {...(href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-card transition-shadow hover:shadow-lg"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-turquoise-soft text-turquoise-deep">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-xl font-medium">{title}</h2>
                <p className="mt-1 font-semibold break-all text-turquoise-deep">
                  {detail}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{note}</p>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 rounded-2xl border bg-card p-5 shadow-card sm:p-8">
            <h2 className="font-display text-2xl">Send us a message</h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Ask anything about tours, safaris or packages. To book a specific trip, use
              the{" "}
              <Link
                href="/book"
                className="text-turquoise-deep underline underline-offset-2"
              >
                booking request form
              </Link>
              .
            </p>
            {isSupabaseConfigured() ? null : (
              <p
                role="note"
                className="mb-6 rounded-xl border border-dashed border-gold bg-gold/10 px-4 py-3 text-sm text-ocean-deep"
              >
                The online form opens soon. Until then, please email, call or WhatsApp us.
              </p>
            )}
            <EnquiryForm available={isSupabaseConfigured()} />
          </div>
          <div className="flex gap-4 self-start rounded-2xl border border-dashed bg-card p-6">
            <MapPin className="size-5 shrink-0 text-gold" aria-hidden="true" />
            <div>
              <h2 className="font-display text-lg">Office address</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Zanzibar, Tanzania. Full address to be supplied by the owner.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

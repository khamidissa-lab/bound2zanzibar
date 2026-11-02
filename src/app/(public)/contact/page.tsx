import type { Metadata } from "next";
import { AtSign, Mail, MapPin, Phone } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { contact, enquiryMailto, siteConfig, socialLinks } from "@/config/site";

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
        <ul className="grid gap-5 md:grid-cols-3">
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

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="flex gap-4 rounded-2xl border border-dashed bg-card p-6">
            <MapPin className="size-5 shrink-0 text-gold" aria-hidden="true" />
            <div>
              <h2 className="font-display text-lg">Office address</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Zanzibar, Tanzania. Full address to be supplied by the owner.
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-sand-soft p-6">
            <h2 className="font-display text-lg">Online enquiry form</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Coming soon. Until then, email or call us and we will reply as soon as we
              can.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

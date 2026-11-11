import type { Metadata } from "next";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import { EnquiryForm } from "@/components/contact/enquiry-form";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons/brand-icons";
import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { PageHeader } from "@/components/shared/page-header";
import { contact, enquiryMailto, socialLinks, whatsappLink } from "@/config/site";
import { getMessages } from "@/i18n/messages";
import { localeAlternates, pageLocale } from "@/i18n/seo";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  return {
    title: t.contact.metaTitle,
    description: t.contact.metaDescription,
    alternates: localeAlternates(locale, "/contact"),
  };
}

const instagram = socialLinks.find((s) => s.label === "Instagram");

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  const c = t.contact;
  const ch = c.channels;
  const channels = [
    {
      icon: Mail,
      title: ch.email,
      detail: contact.email,
      href: enquiryMailto(ch.emailSubject),
      note: ch.emailNote,
    },
    {
      icon: Phone,
      title: ch.phone,
      detail: contact.phoneDisplay,
      href: `tel:${contact.phone}`,
      note: ch.phoneNote,
    },
    {
      icon: WhatsAppIcon,
      title: ch.whatsapp,
      detail: contact.phoneDisplay,
      href: whatsappLink(ch.whatsappMessage),
      note: ch.whatsappNote,
    },
    ...(instagram?.href && instagram.handle
      ? [
          {
            icon: InstagramIcon,
            title: ch.instagram,
            detail: instagram.handle,
            href: instagram.href,
            note: ch.instagramNote,
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        eyebrow={c.eyebrow}
        title={c.title}
        description={c.description}
        crumbs={[{ label: t.nav.home, href: "/" }, { label: t.nav.contact }]}
        tone="ocean"
      />

      <section className="container-page grid gap-14 py-16 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-20">
        <div>
          <p className="eyebrow text-gold-deep">{c.direct}</p>
          <ul className="mt-6 border-t border-ocean-deep/15">
            {channels.map(({ icon: Icon, title, detail, href, note }) => (
              <li key={title} className="border-b border-ocean-deep/15">
                <a
                  href={href}
                  {...(href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group flex gap-5 py-6"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-turquoise-deep/10 text-turquoise-deep transition-colors group-hover:bg-turquoise-deep group-hover:text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="eyebrow block text-muted-foreground">{title}</span>
                    <span
                      dir="ltr"
                      className="mt-1 block font-display text-2xl break-all text-ocean-deep group-hover:text-turquoise-deep sm:text-3xl"
                    >
                      {detail}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {note}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="mt-2 size-5 shrink-0 text-ocean-deep/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ocean-deep rtl:-scale-x-100"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex gap-4 border border-dashed border-gold-deep/50 bg-ivory p-6">
            <MapPin className="size-5 shrink-0 text-gold-deep" aria-hidden="true" />
            <div>
              <h2 className="font-display text-2xl">{c.officeTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{c.officeBody}</p>
            </div>
          </div>
        </div>

        <div className="min-w-0 border border-ocean-deep/15 bg-ivory p-6 shadow-card sm:p-10">
          <h2 className="display-lg text-4xl sm:text-5xl lg:text-5xl">{c.formTitle}</h2>
          <p className="mt-3 mb-8 text-muted-foreground">
            {c.formIntroBefore}{" "}
            <Link href="/book" className="link-underline font-medium text-ocean-deep">
              {c.formIntroLink}
            </Link>
            .
          </p>
          {isSupabaseConfigured() ? null : (
            <p
              role="note"
              className="mb-6 border-s-2 border-gold bg-gold/10 px-4 py-3 text-sm text-ocean-deep"
            >
              {c.formUnavailable}
            </p>
          )}
          <EnquiryForm available={isSupabaseConfigured()} />
        </div>
      </section>
    </>
  );
}

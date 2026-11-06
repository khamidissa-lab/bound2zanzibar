import type { Messages } from "@/i18n/messages/en";

/**
 * Static site configuration.
 *
 * Contact details and social profiles are intentionally `null` until the owner
 * supplies verified information. Components must render a clearly labelled
 * placeholder (never an invented value) when a field is `null`. In a later
 * phase these move to the admin-managed `site_settings` table.
 */

export type NavItem = {
  label: string;
  href: string;
};

export const siteConfig = {
  name: "Bound to Zanzibar",
  tagline: "Your Journey Begins in Zanzibar.",
  description:
    "Zanzibar tours, Tanzania safaris and multi-day travel packages for residents, East African travellers and international visitors.",
} as const;

/** Main navigation; labels come from the visitor's language (see localizedMainNav). */
export const mainNav = [
  { key: "home", href: "/" },
  { key: "tours", href: "/tours" },
  { key: "safari", href: "/safari" },
  { key: "packages", href: "/packages" },
  { key: "destinations", href: "/destinations" },
  { key: "travelGuide", href: "/travel-guide" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const satisfies readonly { key: keyof Messages["nav"]; href: string }[];

export const bookNowHref = "/book";

export function localizedMainNav(t: Messages): NavItem[] {
  return mainNav.map(({ key, href }) => ({ label: t.nav[key], href }));
}

export function localizedFooterNav(t: Messages): { title: string; items: NavItem[] }[] {
  return [
    {
      title: t.footer.explore,
      items: [
        { label: t.nav.tours, href: "/tours" },
        { label: t.footer.tanzaniaSafari, href: "/safari" },
        { label: t.nav.packages, href: "/packages" },
        { label: t.nav.destinations, href: "/destinations" },
        { label: t.finder.metaTitle, href: "/trip-finder" },
      ],
    },
    {
      title: t.footer.company,
      items: [
        { label: t.nav.about, href: "/about" },
        { label: t.nav.travelGuide, href: "/travel-guide" },
        { label: t.nav.contact, href: "/contact" },
        { label: t.footer.bookATrip, href: "/book" },
      ],
    },
    {
      title: t.footer.legal,
      items: [
        { label: t.footer.privacy, href: "/privacy" },
        { label: t.footer.terms, href: "/terms" },
      ],
    },
  ];
}

/**
 * Owner-supplied contact details (provided 2026-10-31). The owner confirmed on
 * 2026-11-02 that the phone number is also the business WhatsApp number.
 */
export const contact = {
  email: "khamidissa@gmail.com",
  phone: "+255622341233",
  phoneDisplay: "+255 622 341 233",
  /** International format without "+", as wa.me expects. */
  whatsapp: "255622341233",
} as const;

/** WhatsApp chat link, optionally with a pre-filled message. */
export function whatsappLink(
  message?: string,
  number: string = contact.whatsapp,
): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export type ContactField = {
  label: string;
  value: string | null;
  href: string | null;
};

/** `null` values are still awaiting verified details from the owner. */
export function localizedContactDetails(t: Messages): ContactField[] {
  return [
    { label: t.footer.phone, value: contact.phoneDisplay, href: `tel:${contact.phone}` },
    { label: t.nav.whatsapp, value: contact.phoneDisplay, href: whatsappLink() },
    { label: t.footer.email, value: contact.email, href: `mailto:${contact.email}` },
    { label: t.footer.officeAddress, value: null, href: null },
  ];
}

export type SocialLink = {
  label: string;
  handle: string | null;
  href: string | null;
};

/** `null` entries are awaiting verified profile URLs from the owner. */
export const socialLinks: readonly SocialLink[] = [
  {
    label: "Instagram",
    handle: "@bound2zanzibar",
    href: "https://www.instagram.com/bound2zanzibar/",
  },
  { label: "Facebook", handle: null, href: null },
  { label: "TikTok", handle: null, href: null },
];

/** Pre-filled email enquiry link, used until online booking requests launch. */
export function enquiryMailto(subject: string): string {
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`;
}

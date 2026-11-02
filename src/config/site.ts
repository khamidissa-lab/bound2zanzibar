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

export const mainNav: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Zanzibar Tours", href: "/tours" },
  { label: "Safari", href: "/safari" },
  { label: "Packages", href: "/packages" },
  { label: "Destinations", href: "/destinations" },
  { label: "Travel Guide", href: "/travel-guide" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const bookNowItem: NavItem = { label: "Book Now", href: "/book" };

export const footerNav: readonly { title: string; items: readonly NavItem[] }[] = [
  {
    title: "Explore",
    items: [
      { label: "Zanzibar Tours", href: "/tours" },
      { label: "Tanzania Safari", href: "/safari" },
      { label: "Packages", href: "/packages" },
      { label: "Destinations", href: "/destinations" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Travel Guide", href: "/travel-guide" },
      { label: "Contact", href: "/contact" },
      { label: "Book a trip", href: "/book" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms & conditions", href: "/terms" },
    ],
  },
];

/** Owner-supplied contact details (provided 2026-10-31). */
export const contact = {
  email: "khamidissa@gmail.com",
  phone: "+255622341233",
  phoneDisplay: "+255 622 341 233",
} as const;

export type ContactField = {
  label: string;
  value: string | null;
  href: string | null;
};

/** `null` values are still awaiting verified details from the owner. */
export const contactDetails: readonly ContactField[] = [
  { label: "Phone", value: contact.phoneDisplay, href: `tel:${contact.phone}` },
  { label: "Email", value: contact.email, href: `mailto:${contact.email}` },
  { label: "Office address", value: null, href: null },
];

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

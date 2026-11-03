import { contact, siteConfig, socialLinks } from "@/config/site";
import { getSiteUrl } from "@/lib/site-url";

/**
 * schema.org TravelAgency data for search engines. Only verified,
 * owner-supplied facts: no address (not supplied yet), ratings or reviews.
 */
export function OrganizationJsonLd() {
  const base = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: siteConfig.name,
    description: siteConfig.description,
    url: base.toString(),
    logo: new URL("/brand/logo.png", base).toString(),
    email: contact.email,
    telephone: contact.phone,
    areaServed: ["Zanzibar", "Tanzania"],
    sameAs: socialLinks.flatMap((s) => (s.href ? [s.href] : [])),
  };
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped cannot break out of the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

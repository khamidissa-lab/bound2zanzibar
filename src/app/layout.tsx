import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";

import { siteConfig } from "@/config/site";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

// Display: Fraunces (soft, characterful serif for headings).
// Body/UI: Manrope (highly legible geometric sans).
const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    locale: "en",
  },
};

export const viewport: Viewport = {
  themeColor: "#022D38",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

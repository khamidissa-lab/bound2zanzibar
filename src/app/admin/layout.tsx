import type { Metadata, Viewport } from "next";

import { siteConfig } from "@/config/site";
import { getSiteUrl } from "@/lib/site-url";

import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: { default: "Admin", template: `%s | Admin · ${siteConfig.name}` },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0A2A38",
};

/** Root layout for the staff area (English only). */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <div className="flex min-h-full flex-1 flex-col bg-background">{children}</div>
      </body>
    </html>
  );
}

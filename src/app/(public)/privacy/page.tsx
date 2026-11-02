import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/shared/page-placeholder";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false },
};

export default function Page() {
  return (
    <PagePlaceholder
      eyebrow="Legal"
      title="Privacy Policy"
      description="How we collect, use and protect personal information. The full policy will be published once approved by the business owner."
    />
  );
}

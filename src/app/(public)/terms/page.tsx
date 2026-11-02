import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/shared/page-placeholder";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  robots: { index: false },
};

export default function Page() {
  return (
    <PagePlaceholder
      eyebrow="Legal"
      title="Terms & Conditions"
      description="Booking, cancellation and service terms. The full terms will be published once approved by the business owner."
    />
  );
}

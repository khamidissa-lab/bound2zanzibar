import type { Metadata } from "next";
import Link from "next/link";

import { WhyTravel } from "@/components/content/why-travel";
import { PageHeader } from "@/components/shared/page-header";
import { SampleBadge } from "@/components/shared/sample-badge";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `About ${siteConfig.name}: a Zanzibar-based travel company for local and international travellers.`,
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title={`About ${siteConfig.name}`}
        description="A Zanzibar-based tourism and travel brand for Tanzanian residents, East African travellers and visitors from around the world."
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <section className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_20rem]">
        <div className="max-w-2xl space-y-5 text-lg leading-relaxed">
          <SampleBadge label="Draft copy — owner to review" />
          <p>
            {siteConfig.name} helps travellers discover Zanzibar and mainland Tanzania —
            from a half-day walk through Stone Town to a multi-day safari combined with
            time on the coast.
          </p>
          <p>
            We plan trips for couples, families, groups and solo travellers, and for both
            local and international guests. That means clear pricing for residents and
            visitors, and options that suit different budgets.
          </p>
          <p>
            Every trip starts with a conversation. Tell us what you would like to see and
            when, and we will suggest an itinerary and confirm availability before
            anything is booked.
          </p>
        </div>

        <aside className="space-y-4 rounded-2xl border border-dashed border-gold bg-card p-6 lg:self-start">
          <h2 className="font-display text-xl">Company details</h2>
          <p className="text-sm text-muted-foreground">
            Our founding story, team, business registration and licence details will be
            published here once supplied and verified.
          </p>
        </aside>
      </section>

      <div className="border-y bg-sand-soft">
        <WhyTravel />
      </div>

      <section className="container-page py-16 text-center">
        <h2 className="text-3xl font-medium">Ready to start planning?</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/tours" className={buttonVariants({ size: "lg" })}>
            Explore tours
          </Link>
          <Link
            href="/contact"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            Contact us
          </Link>
        </div>
      </section>
    </>
  );
}

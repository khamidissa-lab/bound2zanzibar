import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { ArticleCard } from "@/components/content/cards";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SampleBadge } from "@/components/shared/sample-badge";
import { getArticles } from "@/services/content";

export const metadata: Metadata = {
  title: "Travel Guide",
  description:
    "Practical tips for planning a trip to Zanzibar and Tanzania: seasons, culture and packing.",
};

export default async function TravelGuidePage() {
  const articles = await getArticles();

  return (
    <>
      <PageHeader
        eyebrow="Plan your trip"
        title="Travel guide"
        description="Practical, honest advice for planning your visit to Zanzibar and Tanzania."
        crumbs={[{ label: "Home", href: "/" }, { label: "Travel Guide" }]}
      >
        <SampleBadge label="Sample articles — owner to review" />
      </PageHeader>

      <section className="container-page py-16">
        {articles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <EmptyState icon={BookOpen} title="Articles coming soon">
            We are writing our first travel guides.
          </EmptyState>
        )}
      </section>
    </>
  );
}

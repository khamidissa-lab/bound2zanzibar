import type { Metadata } from "next";

import { DestinationCard } from "@/components/content/cards";
import { PageHeader } from "@/components/shared/page-header";
import { SampleBadge } from "@/components/shared/sample-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { getMessages } from "@/i18n/messages";
import { localeAlternates, pageLocale } from "@/i18n/seo";
import { getDestinations } from "@/services/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/destinations">): Promise<Metadata> {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  return {
    title: t.destinations.metaTitle,
    description: t.destinations.metaDescription,
    alternates: localeAlternates(locale, "/destinations"),
  };
}

const SPAN: Record<number, string> = {
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  12: "lg:col-span-12",
};

/** Column spans for an editorial mosaic: rows of 7/5, 4/4/4, 5/7, … */
function mosaicSpans(count: number): string[] {
  const rows = [
    [7, 5],
    [4, 4, 4],
    [5, 7],
  ];
  const spans: number[] = [];
  for (let r = 0; spans.length < count; r++) {
    const row = rows[r % rows.length];
    const left = count - spans.length;
    spans.push(...(left >= row.length ? row : Array(left).fill(12 / left)));
  }
  return spans.map((n) => SPAN[n] ?? SPAN[12]);
}

export default async function DestinationsPage({
  params,
}: PageProps<"/[locale]/destinations">) {
  const locale = pageLocale((await params).locale);
  const t = getMessages(locale);
  const d = t.destinations;
  const destinations = await getDestinations({}, locale);
  const groups = [
    {
      id: "zanzibar",
      eyebrow: d.islandsEyebrow,
      title: t.common.zanzibar,
      items: destinations.filter((x) => x.region === "zanzibar"),
    },
    {
      id: "mainland",
      eyebrow: d.safariEyebrow,
      title: t.common.mainland,
      items: destinations.filter((x) => x.region === "mainland"),
    },
  ].filter((g) => g.items.length > 0);

  return (
    <>
      <PageHeader
        eyebrow={d.eyebrow}
        title={d.title}
        description={d.description}
        crumbs={[{ label: t.nav.home, href: "/" }, { label: t.nav.destinations }]}
        image={{
          src: "/images/photos/aerial-shore.jpg",
          alt: d.headerAlt,
          theme: "ocean",
        }}
      >
        <SampleBadge label={d.sample} />
      </PageHeader>

      <div className="container-page space-y-24 py-16 sm:py-24">
        {groups.map((group, g) => {
          const spans = mosaicSpans(group.items.length);
          return (
            <section key={group.id} aria-labelledby={`${group.id}-heading`}>
              <SectionHeading
                id={`${group.id}-heading`}
                index={String(g + 1).padStart(2, "0")}
                eyebrow={group.eyebrow}
                title={group.title}
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:auto-rows-[22rem] lg:grid-cols-12">
                {group.items.map((item, i) => (
                  <DestinationCard
                    key={item.slug}
                    destination={item}
                    index={i + 1}
                    className={`reveal ${spans[i]}`}
                    imageClassName="aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto"
                    sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

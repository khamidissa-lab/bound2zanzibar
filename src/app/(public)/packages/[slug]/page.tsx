import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BedDouble, CalendarDays, Car, Utensils } from "lucide-react";

import { EnquiryPanel } from "@/components/content/enquiry-panel";
import { ListBlock } from "@/components/content/list-block";
import { SceneImage } from "@/components/media/scene-image";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SampleBadge } from "@/components/shared/sample-badge";
import {
  getNameLookups,
  getPackageBySlug,
  getPackages,
  getTours,
  staticSlugParams,
} from "@/services/content";

export async function generateStaticParams() {
  return staticSlugParams(await getPackages());
}

export async function generateMetadata({
  params,
}: PageProps<"/packages/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) return { title: "Package not found" };
  return {
    title: pkg.seo.title,
    description: pkg.seo.description,
    alternates: { canonical: `/packages/${pkg.slug}` },
    openGraph: {
      title: pkg.seo.title,
      description: pkg.seo.description,
      type: "article",
    },
  };
}

export default async function PackageDetailPage({
  params,
}: PageProps<"/packages/[slug]">) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();

  const [allTours, lookups] = await Promise.all([getTours(), getNameLookups()]);
  const includedTours = allTours.filter((t) => pkg.includedTourSlugs.includes(t.slug));

  const facts = [
    {
      icon: CalendarDays,
      label: "Length",
      value: `${pkg.days} days / ${pkg.nights} nights`,
    },
    { icon: BedDouble, label: "Accommodation", value: pkg.accommodation },
    { icon: Car, label: "Transfers", value: pkg.transfers },
    { icon: Utensils, label: "Meals", value: pkg.meals },
  ];

  return (
    <>
      <div className="container-page pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Packages", href: "/packages" },
            { label: pkg.name },
          ]}
        />
      </div>

      <article className="container-page pt-6 pb-16">
        <header className="max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-turquoise-deep">
              {pkg.days} days · {pkg.nights} nights
            </span>
            {pkg.isSafari ? (
              <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-medium text-ocean-deep">
                Includes safari
              </span>
            ) : null}
            {pkg.isSample ? <SampleBadge /> : null}
          </div>
          <h1 className="text-4xl font-medium sm:text-5xl">{pkg.name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{pkg.summary}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Destinations:{" "}
            {pkg.destinationSlugs.map((d, i) => (
              <span key={d}>
                {i > 0 ? ", " : null}
                <Link
                  href={`/destinations/${d}`}
                  className="text-turquoise-deep hover:underline"
                >
                  {lookups.destinations[d] ?? d}
                </Link>
              </span>
            ))}
          </p>
        </header>

        <SceneImage
          image={pkg.coverImage}
          priority
          sizes="100vw"
          className="mt-8 aspect-[16/10] rounded-2xl sm:aspect-[21/8]"
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-12">
            <dl className="grid gap-4 rounded-2xl bg-sand-soft p-5 sm:grid-cols-2">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <Icon
                    className="mt-0.5 size-5 shrink-0 text-turquoise-deep"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-medium text-ocean-deep">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <section>
              <h2 className="mb-4 text-2xl font-medium">Overview</h2>
              <div className="space-y-4 text-lg leading-relaxed">
                {pkg.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section aria-labelledby="itinerary-heading">
              <h2 id="itinerary-heading" className="mb-6 text-2xl font-medium">
                Day-by-day itinerary
              </h2>
              <ol className="relative space-y-6 border-l-2 border-turquoise/40 pl-6">
                {pkg.itinerary.map((day) => (
                  <li key={day.day} className="relative">
                    <span
                      className="absolute top-1 -left-[2.05rem] flex size-5 items-center justify-center rounded-full border-2 border-turquoise bg-warm-white"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-semibold text-turquoise-deep">
                      Day {day.day}
                    </p>
                    <h3 className="mt-0.5 text-xl font-medium">{day.title}</h3>
                    <p className="mt-2 leading-relaxed">{day.description}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {day.overnight ? `Overnight: ${day.overnight}` : "No overnight"}
                      {day.meals.length > 0 ? ` · Meals: ${day.meals.join(", ")}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            {includedTours.length > 0 ? (
              <section>
                <h2 className="mb-4 text-2xl font-medium">Experiences included</h2>
                <ul className="flex flex-wrap gap-2">
                  {includedTours.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={`/tours/${t.slug}`}
                        className="inline-flex rounded-full border bg-card px-4 py-2 text-sm font-medium text-ocean-deep hover:border-turquoise-deep"
                      >
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="grid gap-10 sm:grid-cols-2">
              <ListBlock title="Included" items={pkg.included} icon="check" />
              <ListBlock title="Not included" items={pkg.excluded} icon="cross" />
            </div>
            <ListBlock title="Terms" items={pkg.terms} />
          </div>

          <div className="order-first lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:order-none lg:self-start">
            <EnquiryPanel itemName={pkg.name} prices={pkg.prices} />
          </div>
        </div>
      </article>
    </>
  );
}

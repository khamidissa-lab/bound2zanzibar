import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccessDenied } from "@/components/admin/admin-states";
import { JourneyDetail } from "@/components/admin/journeys/journey-views";
import { getMessages } from "@/i18n/messages";
import { requireStaffPage } from "@/lib/auth/session";
import { TRAVEL_STYLES } from "@/lib/discovery";
import { JOURNEY_REFERENCE_RE } from "@/lib/journey/request";
import { getCategories, getDestinations } from "@/services/content";
import { getJourney } from "@/services/journeys";

export async function generateMetadata({
  params,
}: PageProps<"/admin/journeys/[reference]">): Promise<Metadata> {
  return { title: `Journey ${(await params).reference}` };
}

export default async function AdminJourneyPage({
  params,
}: PageProps<"/admin/journeys/[reference]">) {
  const { reference } = await params;
  const { allowed } = await requireStaffPage(
    "bookings.manage",
    `/admin/journeys/${encodeURIComponent(reference)}`,
  );
  if (!allowed) return <AccessDenied />;
  if (!JOURNEY_REFERENCE_RE.test(reference)) notFound();

  const [journey, destinations, categories] = await Promise.all([
    getJourney(reference),
    getDestinations(),
    getCategories(),
  ]);
  if (!journey) notFound();

  // The admin is in English; interests are travel styles or tour categories.
  const en = getMessages("en");
  const interestLabels: Record<string, string> = {
    ...Object.fromEntries(TRAVEL_STYLES.map((s) => [s, en.travelStyles[s]])),
    ...Object.fromEntries(categories.map((c) => [c.slug, c.name])),
  };

  return (
    <JourneyDetail
      backHref="/admin/journeys"
      journey={journey}
      destinationNames={Object.fromEntries(destinations.map((d) => [d.slug, d.name]))}
      interestLabels={interestLabels}
    />
  );
}

import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/shared/page-placeholder";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/terms">): Promise<Metadata> {
  const { locale } = await params;
  const t = getMessages(isLocale(locale) ? locale : DEFAULT_LOCALE);
  return { title: t.legal.termsTitle, robots: { index: false } };
}

export default async function Page({ params }: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  const t = getMessages(isLocale(locale) ? locale : DEFAULT_LOCALE);
  return (
    <PagePlaceholder
      eyebrow={t.legal.eyebrow}
      title={t.legal.termsTitle}
      description={t.legal.termsBody}
      buildingLabel={t.legal.building}
      backLabel={t.common.backHome}
    />
  );
}

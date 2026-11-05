import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/shared/page-placeholder";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  const t = getMessages(isLocale(locale) ? locale : DEFAULT_LOCALE);
  return { title: t.legal.privacyTitle, robots: { index: false } };
}

export default async function Page({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  const t = getMessages(isLocale(locale) ? locale : DEFAULT_LOCALE);
  return (
    <PagePlaceholder
      eyebrow={t.legal.eyebrow}
      title={t.legal.privacyTitle}
      description={t.legal.privacyBody}
      buildingLabel={t.legal.building}
      backLabel={t.common.backHome}
    />
  );
}

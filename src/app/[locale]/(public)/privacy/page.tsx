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
    <>
      <PagePlaceholder
        eyebrow={t.legal.eyebrow}
        title={t.legal.privacyTitle}
        description={t.legal.privacyBody}
        buildingLabel={t.legal.building}
        backLabel={t.common.backHome}
      />
      {/* Already in force: how the visitor statistics on this site work. */}
      <section aria-labelledby="tracking" className="container-page py-16 sm:py-20">
        <h2 id="tracking" className="display-lg max-w-3xl text-ocean-deep">
          {t.tracking.title}
        </h2>
        <ul className="mt-6 max-w-3xl list-disc space-y-3 ps-5 leading-relaxed text-ocean-deep/85">
          {t.tracking.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

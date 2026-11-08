import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { CircleCheck, LinkIcon } from "lucide-react";

import { ReviewForm } from "@/components/reviews/review-form";
import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { pageLocale } from "@/i18n/seo";
import { getI18n } from "@/i18n/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getReviewInvitation } from "@/services/reviews";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/review/[token]">): Promise<Metadata> {
  const { t } = getI18n(pageLocale((await params).locale));
  // Private links: never indexed.
  return { title: t.reviewPage.metaTitle, robots: { index: false, follow: false } };
}

/** Private review page for a completed booking, reached from a link staff send. */
export default async function ReviewPage({
  params,
}: PageProps<"/[locale]/review/[token]">) {
  const { locale: raw } = await params;
  const locale = pageLocale(raw);
  return (
    <section className="bg-tide flex justify-center px-4 py-16 sm:py-24">
      <div className="w-full max-w-2xl border border-ocean-deep/15 bg-ivory p-6 shadow-card sm:p-10">
        <Suspense fallback={null}>
          <ReviewContent params={params} locale={locale} />
        </Suspense>
      </div>
    </section>
  );
}

async function ReviewContent({
  params,
  locale,
}: {
  params: PageProps<"/[locale]/review/[token]">["params"];
  locale: Locale;
}) {
  await connection();
  const { token } = await params;
  const { t, fmt } = getI18n(locale);
  const p = t.reviewPage;
  const invitation =
    UUID.test(token) && isSupabaseConfigured() ? await getReviewInvitation(token) : null;

  if (!invitation || invitation.alreadyReviewed) {
    const thanks = invitation?.alreadyReviewed;
    const Icon = thanks ? CircleCheck : LinkIcon;
    return (
      <div className="text-center">
        <Icon className="mx-auto size-12 text-turquoise-deep" aria-hidden="true" />
        <h1 className="mt-5 font-display text-4xl text-ocean-deep">
          {thanks ? p.alreadyTitle : p.invalidTitle}
        </h1>
        {thanks ? null : <p className="mt-3 text-muted-foreground">{p.invalidBody}</p>}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/contact" className={buttonVariants({ variant: "outline" })}>
            {t.nav.contact}
          </Link>
          <Link href="/" className={buttonVariants()}>
            {t.common.backHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-4xl leading-tight text-ocean-deep">
        {fmt(p.greeting, { name: invitation.firstName, item: invitation.itemName })}
      </h1>
      <p className="mt-3 mb-8 text-muted-foreground">{p.intro}</p>
      <ReviewForm token={token} defaultName={invitation.firstName} />
    </>
  );
}

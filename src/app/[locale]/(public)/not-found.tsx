"use client";

import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";

/**
 * Public 404 in the visitor's language, inside the site header and footer.
 */
export default function NotFound() {
  const { t } = useI18n();
  return (
    <section className="bg-tide bg-ivory">
      <div className="container-page flex min-h-[70vh] flex-col justify-center py-20">
        <p className="font-display text-8xl leading-none text-gold-deep italic sm:text-9xl">
          404
        </p>
        <h1 className="display-lg mt-6">{t.notFound.title}</h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">{t.notFound.body}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            {t.notFound.home}
          </Link>
          <Link
            href="/tours"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            {t.notFound.browse}
          </Link>
        </div>
      </div>
    </section>
  );
}

import { ArrowLeft, Hammer } from "lucide-react";

import { LocaleLink as Link } from "@/components/i18n/locale-link";
import { buttonVariants } from "@/components/ui/button";

type PagePlaceholderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  /** "This page is being built…" in the visitor's language. */
  buildingLabel: string;
  backLabel: string;
};

/**
 * Honest stand-in for routes that are scheduled for a later build phase, so
 * navigation never leads to a dead link or to fake functionality.
 */
export function PagePlaceholder({
  eyebrow,
  title,
  description,
  buildingLabel,
  backLabel,
}: PagePlaceholderProps) {
  return (
    <section className="bg-tide border-b bg-ivory">
      <div className="container-page flex min-h-[60vh] flex-col justify-center py-20">
        {eyebrow ? (
          <p className="eyebrow mb-5 flex items-center gap-3 text-gold-deep">
            <span aria-hidden="true" className="h-px w-10 bg-current" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="display-xl max-w-4xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
        <p className="mt-8 inline-flex w-fit items-center gap-2 border border-dashed border-gold-deep/50 bg-ivory px-4 py-2 text-sm text-ocean-deep">
          <Hammer className="size-4 text-gold" aria-hidden="true" />
          {buildingLabel}
        </p>
        <div className="mt-10">
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft
              aria-hidden="true"
              data-icon="inline-start"
              className="rtl:-scale-x-100"
            />
            {backLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowLeft, Hammer } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

type PagePlaceholderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

/**
 * Honest stand-in for routes that are scheduled for a later build phase, so
 * navigation never leads to a dead link or to fake functionality.
 */
export function PagePlaceholder({ eyebrow, title, description }: PagePlaceholderProps) {
  return (
    <section className="bg-tide border-b">
      <div className="container-page flex min-h-[60vh] flex-col justify-center py-20">
        {eyebrow ? (
          <p className="mb-3 text-sm font-semibold text-turquoise-deep">{eyebrow}</p>
        ) : null}
        <h1 className="max-w-3xl text-4xl font-medium sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
        <p className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-dashed border-gold bg-card px-4 py-2 text-sm text-ocean-deep">
          <Hammer className="size-4 text-gold" aria-hidden="true" />
          This page is being built and will be available soon.
        </p>
        <div className="mt-10">
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft aria-hidden="true" data-icon="inline-start" />
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}

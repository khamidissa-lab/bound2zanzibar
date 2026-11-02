import Link from "next/link";
import { ArrowRight } from "lucide-react";

type SectionHeadingProps = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  link?: { href: string; label: string };
};

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  link,
}: SectionHeadingProps) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-sm font-semibold text-turquoise-deep">{eyebrow}</p>
        ) : null}
        <h2 id={id} className="text-3xl font-medium sm:text-4xl">
          {title}
        </h2>
        {description ? <p className="mt-3 text-muted-foreground">{description}</p> : null}
      </div>
      {link ? (
        <Link
          href={link.href}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-turquoise-deep hover:underline"
        >
          {link.label}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

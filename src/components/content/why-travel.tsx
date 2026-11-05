import { SectionHeading } from "@/components/shared/section-heading";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

// Brand commitments (not credentials or claims of experience). Owner to review.
export function WhyTravel({
  locale,
  headingId = "why-heading",
  index,
}: {
  locale: Locale;
  headingId?: string;
  index?: string;
}) {
  const { why } = getMessages(locale);
  return (
    <section aria-labelledby={headingId} className="py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          id={headingId}
          index={index}
          eyebrow={why.eyebrow}
          title={why.title}
          className="mb-12"
        />
        <ol className="grid border-t border-ocean-deep/15 sm:grid-cols-2 lg:grid-cols-4">
          {why.reasons.map(({ title, body }, i) => (
            <li
              key={title}
              className="reveal border-b border-ocean-deep/15 py-8 sm:pe-8 lg:border-e lg:border-b-0 lg:px-8 lg:first:ps-0 lg:last:border-e-0"
            >
              <span className="font-display text-5xl leading-none text-gold-deep italic">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 font-display text-2xl">{title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

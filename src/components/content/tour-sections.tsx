import { ChevronDown, MapPin } from "lucide-react";

import type { Locale } from "@/i18n/config";
import { getMessages, type Messages } from "@/i18n/messages";
import type { Faq, Tour } from "@/types/content";

import { ListBlock } from "./list-block";

export function tourSectionLinks(t: Messages) {
  return [
    { id: "overview", label: t.tour.sections.overview },
    { id: "itinerary", label: t.tour.sections.itinerary },
    { id: "included", label: t.tour.sections.included },
    { id: "good-to-know", label: t.tour.sections.goodToKnow },
    { id: "faqs", label: t.tour.sections.faqs },
  ];
}

function SectionTitle({
  id,
  index,
  children,
}: {
  id: string;
  index: string;
  children: string;
}) {
  return (
    <div className="mb-7 flex items-baseline gap-4 border-t border-ocean-deep/15 pt-5">
      <span className="eyebrow text-gold-deep tabular-nums">{index}</span>
      <h2 id={id} className="font-display text-4xl sm:text-[2.6rem]">
        {children}
      </h2>
    </div>
  );
}

/**
 * Tour information as one continuous editorial read (no hidden tabs), so all
 * content is visible to visitors and search engines. Each section has an id
 * for the in-page navigation.
 */
export function TourSections({ tour, locale }: { tour: Tour; locale: Locale }) {
  const t = getMessages(locale);
  const faqs: Faq[] = [...tour.faqs, ...t.generalFaqs];

  return (
    <div className="space-y-20">
      <section aria-labelledby="overview-title" id="overview" className="scroll-mt-32">
        <SectionTitle id="overview-title" index="01">
          {t.tour.about}
        </SectionTitle>
        <div className="space-y-5 text-lg leading-relaxed text-ink/90 first-letter:float-start first-letter:me-3 first-letter:font-display first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-gold-deep">
          {tour.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {tour.highlights.length > 0 ? (
          <div className="mt-10 bg-sand-soft p-6 sm:p-8">
            <h3 className="eyebrow text-gold-deep">{t.tour.highlights}</h3>
            <ul className="mt-5 grid gap-x-10 gap-y-3 sm:grid-cols-2">
              {tour.highlights.map((item) => (
                <li key={item} className="flex gap-3 text-ocean-deep">
                  <span
                    aria-hidden="true"
                    className="mt-3 h-px w-4 shrink-0 bg-gold-deep"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {tour.whatToExpect.length > 0 ? (
        <section
          aria-labelledby="itinerary-title"
          id="itinerary"
          className="scroll-mt-32"
        >
          <SectionTitle id="itinerary-title" index="02">
            {t.tour.whatToExpect}
          </SectionTitle>
          <ol className="border-s border-ocean-deep/20">
            {tour.whatToExpect.map((step, index) => (
              <li
                key={`${index}-${step.title}`}
                className="relative ps-10 pb-8 last:pb-0"
              >
                <span
                  aria-hidden="true"
                  className="absolute -start-[0.95rem] top-0 flex size-[1.9rem] items-center justify-center border border-ocean-deep/20 bg-warm-white font-display text-sm text-ocean-deep"
                >
                  {index + 1}
                </span>
                <h3 className="font-display text-2xl">{step.title}</h3>
                {step.description ? (
                  <p className="mt-1.5 max-w-2xl leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section aria-labelledby="included-title" id="included" className="scroll-mt-32">
        <SectionTitle id="included-title" index="03">
          {t.tour.whatsIncluded}
        </SectionTitle>
        {tour.included.length === 0 ? (
          <p className="mb-8 text-lg leading-relaxed">{t.tour.includedFallback}</p>
        ) : null}
        <div className="grid gap-10 sm:grid-cols-2">
          <ListBlock title={t.tour.included} items={tour.included} icon="check" />
          <ListBlock title={t.tour.notIncluded} items={tour.excluded} icon="cross" />
        </div>
        <ListBlock
          title={t.tour.whatToBring}
          items={tour.whatToBring}
          className="mt-10"
        />
      </section>

      <section aria-labelledby="good-title" id="good-to-know" className="scroll-mt-32">
        <SectionTitle id="good-title" index="04">
          {t.tour.goodToKnow}
        </SectionTitle>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {tour.goodToKnow.length > 0 ? (
            <ul className="space-y-3">
              {tour.goodToKnow.map((note) => (
                <li
                  key={note}
                  className="border-s-2 border-turquoise ps-4 leading-relaxed text-ink/90"
                >
                  {note}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="bg-ocean-deep p-6 text-ivory">
            <h3 className="eyebrow flex items-center gap-2 font-sans text-gold-light">
              <MapPin className="size-4" aria-hidden="true" />
              {t.tour.meetingPoint}
            </h3>
            <p className="mt-3 leading-relaxed text-white/85">{tour.meetingPoint}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="faqs-title" id="faqs" className="scroll-mt-32">
        <SectionTitle id="faqs-title" index="05">
          {t.tour.faqs}
        </SectionTitle>
        <div className="border-t border-ocean-deep/15">
          {faqs.map((faq) => (
            <details key={faq.question} className="group border-b border-ocean-deep/15">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-xl text-ocean-deep [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown
                  className="size-5 shrink-0 text-gold-deep transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="-mt-1 max-w-2xl pb-6 leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

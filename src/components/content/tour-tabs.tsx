import { ChevronDown, Info, MapPin } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generalTourFaqs } from "@/config/tour-faqs";
import type { Faq, Tour } from "@/types/content";

import { ListBlock } from "./list-block";

// Underline sits inside the row (bottom-0) so the scroll container can't clip it.
const triggerClass =
  "flex-none rounded-none px-1 py-3 text-base text-ocean-deep/70 after:bg-turquoise-deep group-data-horizontal/tabs:after:bottom-0 hover:text-ocean-deep data-active:font-semibold data-active:text-ocean-deep";

/**
 * Tour information in tabs. "More details" is open by default. Panels stay
 * mounted (hidden when inactive) so all content is in the page HTML for
 * search engines and before JavaScript loads.
 */
export function TourTabs({ tour }: { tour: Tour }) {
  const faqs: Faq[] = [...tour.faqs, ...generalTourFaqs];

  return (
    <Tabs defaultValue="details" className="gap-6">
      <TabsList
        variant="line"
        aria-label="Tour information"
        // Scrolls sideways on small screens; scrollbar hidden (the cut-off
        // last tab shows there is more).
        className="h-auto w-full [scrollbar-width:none] justify-start gap-6 overflow-x-auto overflow-y-hidden rounded-none border-b p-0 [&::-webkit-scrollbar]:hidden"
      >
        <TabsTrigger value="details" className={triggerClass}>
          More details
        </TabsTrigger>
        <TabsTrigger value="overview" className={triggerClass}>
          Overview
        </TabsTrigger>
        <TabsTrigger value="included" className={triggerClass}>
          What&apos;s included
        </TabsTrigger>
        <TabsTrigger value="faqs" className={triggerClass}>
          FAQs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" keepMounted className="space-y-10 text-base">
        {tour.whatToExpect.length > 0 ? (
          <section>
            <h2 className="mb-5 text-2xl font-medium">What to expect</h2>
            <ol className="relative space-y-5 border-l-2 border-turquoise/40 pl-7">
              {tour.whatToExpect.map((step, index) => (
                <li key={`${index}-${step.title}`} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-0 -left-[2.6rem] flex size-7 items-center justify-center rounded-full bg-ocean-deep text-xs font-semibold text-white"
                  >
                    {index + 1}
                  </span>
                  <h3 className="font-sans text-base font-semibold text-ocean-deep">
                    {step.title}
                  </h3>
                  {step.description ? (
                    <p className="mt-1 leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {tour.goodToKnow.length > 0 ? (
          <section className="rounded-2xl bg-turquoise-soft/60 p-5 sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-medium">
              <Info className="size-5 text-turquoise-deep" aria-hidden="true" />
              Good to know
            </h2>
            <ul className="list-disc space-y-2 pl-5 marker:text-turquoise-deep">
              {tour.goodToKnow.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-xl font-medium">
            <MapPin className="size-5 text-turquoise-deep" aria-hidden="true" />
            Meeting point & pickup
          </h2>
          <p className="text-lg leading-relaxed">{tour.meetingPoint}</p>
        </section>
      </TabsContent>

      <TabsContent value="overview" keepMounted className="space-y-10 text-base">
        <section>
          <h2 className="mb-4 text-2xl font-medium">About this experience</h2>
          <div className="space-y-4 text-lg leading-relaxed">
            {tour.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
        <ListBlock title="Highlights" items={tour.highlights} />
      </TabsContent>

      <TabsContent value="included" keepMounted className="space-y-10 text-base">
        <div className="grid gap-10 sm:grid-cols-2">
          <ListBlock title="Included" items={tour.included} icon="check" />
          <ListBlock title="Not included" items={tour.excluded} icon="cross" />
        </div>
        <ListBlock title="What to bring" items={tour.whatToBring} />
      </TabsContent>

      <TabsContent value="faqs" keepMounted className="text-base">
        <h2 className="mb-4 text-2xl font-medium">Frequently asked questions</h2>
        <div className="divide-y rounded-2xl border bg-card">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ocean-deep [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown
                  className="size-4 shrink-0 text-turquoise-deep transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-2 leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}

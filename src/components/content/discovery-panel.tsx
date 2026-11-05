"use client";

import Form from "next/form";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";

type Option = { slug: string; name: string };

// Underlined fields on the ocean band; native controls keep it accessible.
const fieldClass =
  "h-11 w-full border-0 border-b border-white/35 bg-transparent px-0 text-base text-ivory placeholder:text-white/50 focus:border-gold-light focus-visible:outline-gold-light [&>option]:text-ocean-deep";

/**
 * Homepage trip discovery. Submits a GET to /tours, whose filters read the
 * same query params — so it works with or without JavaScript.
 */
export function DiscoveryPanel({
  categories,
  destinations,
}: {
  categories: Option[];
  destinations: Option[];
}) {
  const { t, href } = useI18n();
  const s = t.home.search;
  return (
    <Form
      action={href("/tours")}
      role="search"
      aria-label={s.label}
      className="grid gap-6 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-end md:gap-8"
    >
      <label className="block">
        <span className="eyebrow mb-1 block text-gold-light">{s.want}</span>
        <input
          name="q"
          type="search"
          placeholder={s.wantPlaceholder}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="eyebrow mb-1 block text-gold-light">{s.where}</span>
        <select name="destination" defaultValue="" className={fieldClass}>
          <option value="">{s.anywhere}</option>
          {destinations.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="eyebrow mb-1 block text-gold-light">{s.type}</span>
        <select name="category" defaultValue="" className={fieldClass}>
          <option value="">{s.allExperiences}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" size="lg" variant="light">
        {s.submit}
        <ArrowRight
          aria-hidden="true"
          data-icon="inline-end"
          className="rtl:-scale-x-100"
        />
      </Button>
    </Form>
  );
}

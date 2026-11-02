import Form from "next/form";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

type Option = { slug: string; name: string };

const fieldClass =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-ocean-deep";

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
  return (
    <Form
      action="/tours"
      role="search"
      aria-label="Find an experience"
      className="grid gap-3 rounded-2xl border bg-card p-4 shadow-card sm:p-5 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end"
    >
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-ocean-deep">
          What would you like to do?
        </span>
        <input
          name="q"
          type="search"
          placeholder="e.g. snorkelling, Stone Town"
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-ocean-deep">Where</span>
        <select name="destination" defaultValue="" className={fieldClass}>
          <option value="">Anywhere</option>
          {destinations.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-ocean-deep">Type</span>
        <select name="category" defaultValue="" className={fieldClass}>
          <option value="">All experiences</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" size="lg" className="h-12 rounded-xl">
        <Search aria-hidden="true" data-icon="inline-start" />
        Find experiences
      </Button>
    </Form>
  );
}

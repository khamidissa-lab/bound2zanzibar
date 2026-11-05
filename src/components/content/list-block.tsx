import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

const icons = {
  check: { Icon: Check, className: "text-turquoise-deep" },
  cross: { Icon: X, className: "text-muted-foreground" },
  dot: { Icon: null, className: "" },
} as const;

export function ListBlock({
  title,
  items,
  icon = "dot",
  className,
  headingLevel = "h3",
}: {
  title: string;
  items: string[];
  icon?: keyof typeof icons;
  className?: string;
  /** Use "h2" when the list sits directly under the page title. */
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  if (items.length === 0) return null;
  const { Icon, className: iconClass } = icons[icon];
  return (
    <section className={className}>
      <Heading className="eyebrow mb-4 text-gold-deep">{title}</Heading>
      <ul className="divide-y divide-ocean-deep/10 border-y border-ocean-deep/10">
        {items.map((item) => (
          <li key={item} className="flex gap-3 py-2.5">
            {Icon ? (
              <Icon
                className={cn("mt-1 size-4 shrink-0", iconClass)}
                aria-hidden="true"
              />
            ) : (
              <span aria-hidden="true" className="mt-3 h-px w-3 shrink-0 bg-gold-deep" />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

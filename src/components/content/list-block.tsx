import { Check, Dot, X } from "lucide-react";

import { cn } from "@/lib/utils";

const icons = {
  check: { Icon: Check, className: "text-turquoise-deep" },
  cross: { Icon: X, className: "text-muted-foreground" },
  dot: { Icon: Dot, className: "text-gold" },
} as const;

export function ListBlock({
  title,
  items,
  icon = "dot",
  className,
}: {
  title: string;
  items: string[];
  icon?: keyof typeof icons;
  className?: string;
}) {
  if (items.length === 0) return null;
  const { Icon, className: iconClass } = icons[icon];
  return (
    <section className={className}>
      <h2 className="mb-4 text-2xl font-medium">{title}</h2>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <Icon
              className={cn("mt-0.5 size-5 shrink-0", iconClass)}
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

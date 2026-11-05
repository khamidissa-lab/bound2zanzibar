import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center border border-dashed border-ocean-deep/20 bg-ivory px-6 py-16 text-center">
      <Icon className="size-6 text-gold-deep" aria-hidden="true" />
      <h3 className="mt-4 font-display text-3xl">{title}</h3>
      {children ? (
        <div className="mt-3 max-w-md text-muted-foreground">{children}</div>
      ) : null}
    </div>
  );
}

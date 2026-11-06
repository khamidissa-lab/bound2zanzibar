import type { BookingStatus } from "@/lib/booking/status";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/services/admin-dashboard-model";

const STYLES: Record<BookingStatus, string> = {
  pending: "bg-gold/15 text-ocean-deep ring-gold/50",
  confirmed: "bg-turquoise-soft text-ocean-deep ring-turquoise/50",
  paid: "bg-[#E1F4EA] text-[#11633A] ring-[#11633A]/30",
  completed: "bg-ocean-deep text-white ring-ocean-deep",
  cancelled: "bg-muted text-muted-foreground ring-border",
  rejected: "bg-destructive/10 text-destructive ring-destructive/30",
};

/** Status pill: the label text always carries the meaning, colour only supports it. */
export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

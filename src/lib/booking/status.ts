import type { Enums } from "@/lib/supabase/database.types";

export type BookingStatus = Enums<"booking_status">;

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "paid",
  "completed",
  "cancelled",
  "rejected",
] as const satisfies readonly BookingStatus[];

/** What each status means, shown to staff when changing it. */
export const STATUS_HINTS: Record<BookingStatus, string> = {
  pending: "New request. Check availability and reply to the customer.",
  confirmed: "You have confirmed availability and the final price in writing.",
  paid: "Payment has been received and recorded below. Only possible once recorded payments cover the quote.",
  completed: "The trip has taken place.",
  cancelled: "Cancelled by the customer or the team after confirmation.",
  rejected: "Declined, for example no availability on that date.",
};

/**
 * Allowed status changes. Finished bookings can be reopened in case of a
 * mistake; every change is recorded in the status history. "Paid" is also
 * checked by the database against recorded payments.
 */
const TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  pending: ["confirmed", "rejected", "cancelled"],
  confirmed: ["paid", "completed", "cancelled", "pending"],
  paid: ["completed", "cancelled", "confirmed"],
  completed: ["paid", "confirmed"],
  cancelled: ["pending"],
  rejected: ["pending"],
};

export function nextStatuses(from: BookingStatus): readonly BookingStatus[] {
  return TRANSITIONS[from];
}

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return from === to || TRANSITIONS[from].includes(to);
}

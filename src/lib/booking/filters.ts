import { BOOKING_STATUSES, type BookingStatus } from "./status";

export type BookingListFilters = {
  status?: BookingStatus;
  type?: "tour" | "package";
  q?: string;
  from?: string;
  to?: string;
};

type Params = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const isoDate = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);

/** Reads list filters and page from URL search params, dropping anything invalid. */
export function parseBookingParams(params: Params | URLSearchParams): {
  filters: BookingListFilters;
  page: number;
} {
  const get = (key: string) =>
    params instanceof URLSearchParams ? (params.get(key) ?? "") : first(params[key]);
  const status = get("status");
  const type = get("type");
  const page = Number.parseInt(get("page"), 10);
  return {
    filters: {
      status: (BOOKING_STATUSES as readonly string[]).includes(status)
        ? (status as BookingStatus)
        : undefined,
      type: type === "tour" || type === "package" ? type : undefined,
      q: get("q").trim().slice(0, 100) || undefined,
      from: isoDate(get("from")),
      to: isoDate(get("to")),
    },
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 10_000) : 1,
  };
}

/** Query string for the given filters (page omitted when 1). */
export function bookingQuery(filters: BookingListFilters, page = 1): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

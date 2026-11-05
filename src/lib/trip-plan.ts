/**
 * A visitor's travel date and group size, carried in the URL from the tour
 * search to the booking form. Values are strings exactly as the inputs use
 * them; anything malformed is dropped rather than guessed.
 */
export type TripPlan = { date: string; adults: string; children: string };

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const count = (v: string | null, min: number, max: number) => {
  if (!v || !/^\d{1,3}$/.test(v)) return "";
  const n = Number(v);
  return n >= min && n <= max ? String(n) : "";
};

export function tripPlanFromParams(get: (key: string) => string | null): TripPlan {
  const date = get("date") ?? "";
  return {
    date: DATE.test(date) && !Number.isNaN(Date.parse(date)) ? date : "",
    adults: count(get("adults"), 1, 50),
    children: count(get("children"), 0, 50),
  };
}

/** Query string fragment (no leading "?" or "&"); empty when nothing is set. */
export function tripPlanQuery(plan: TripPlan): string {
  const params = new URLSearchParams();
  if (plan.date) params.set("date", plan.date);
  if (plan.adults) params.set("adults", plan.adults);
  if (plan.children) params.set("children", plan.children);
  return params.toString();
}

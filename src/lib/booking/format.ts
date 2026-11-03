/** Small display helpers shared by the admin booking pages and the CSV export. */

export function guestsLabel(adults: number, children: number): string {
  const a = `${adults} adult${adults === 1 ? "" : "s"}`;
  return children > 0 ? `${a}, ${children} child${children === 1 ? "" : "ren"}` : a;
}

export function itemName(row: {
  tour: { name: string } | null;
  package: { name: string } | null;
}): string {
  return row.tour?.name ?? row.package?.name ?? "Item removed";
}

/** Date and time in Zanzibar, e.g. "2 Nov, 14:05". */
export function formatReceived(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Dar_es_Salaam",
  }).format(new Date(iso));
}

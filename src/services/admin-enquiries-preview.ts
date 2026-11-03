import "server-only";

import type { EnquiryStatus } from "@/lib/enquiry/request";

import type { Enquiry, EnquiryFilters } from "./enquiries";

/*
 * DEVELOPMENT PREVIEW ONLY. Obviously fake EXAMPLE enquiries so the inbox can
 * be reviewed before a database is connected. Never used on the live site.
 */

const EXAMPLES: [string, string, EnquiryStatus, boolean][] = [
  [
    "Safari in March",
    "EXAMPLE: Is March a good time for Ngorongoro? We are 2 adults.",
    "new",
    true,
  ],
  [
    "Honeymoon ideas",
    "EXAMPLE: Could you suggest a 6-day plan with beach time?",
    "new",
    false,
  ],
  ["", "EXAMPLE: Do your tours include hotel pickup in Paje?", "in_progress", true],
  [
    "Group of 12",
    "EXAMPLE: We are a school group of 12. Do you offer group prices?",
    "new",
    true,
  ],
  [
    "Vegetarian food",
    "EXAMPLE: Can the spice tour lunch be vegetarian?",
    "closed",
    false,
  ],
  [
    "Wheelchair access",
    "EXAMPLE: Is the Stone Town tour suitable for a wheelchair user?",
    "in_progress",
    false,
  ],
];

export function previewEnquiries(now: Date): Enquiry[] {
  return EXAMPLES.map(([subject, message, status, phone], i) => {
    const created = new Date(now.getTime() - (i * 27 + 2) * 3600_000).toISOString();
    return {
      id: `00000000-0000-4000-9000-${String(i).padStart(12, "0")}`,
      name: `Example visitor ${i + 1}`,
      email: `visitor${i + 1}@example.com`,
      phone: phone ? `+255 700 000 1${String(i).padStart(2, "0")}` : null,
      subject: subject || null,
      message,
      status,
      internal_notes: status === "closed" ? "EXAMPLE note: answered by email." : null,
      created_at: created,
      updated_at: created,
    };
  });
}

export function filterEnquiries(rows: Enquiry[], f: EnquiryFilters): Enquiry[] {
  const q = f.q?.toLowerCase();
  return rows.filter(
    (e) =>
      (!f.status || e.status === f.status) &&
      (!q || [e.name, e.email, e.subject ?? ""].some((v) => v.toLowerCase().includes(q))),
  );
}

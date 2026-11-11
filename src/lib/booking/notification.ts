import { formatDate, marketLabels } from "@/lib/format";

import type { BookingRequest } from "./request";

/**
 * The email the team receives when a visitor sends a booking request.
 * Plain text, so nothing a visitor typed can be rendered as HTML.
 */

/** Keeps visitor text to one line (for the subject) and trims it. */
const oneLine = (s: string, max = 80) =>
  s
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, max);

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function bookingNotification(input: {
  request: BookingRequest;
  reference: string;
  itemName: string;
  adminUrl: string;
}): { subject: string; text: string } {
  const { request: r, reference, itemName, adminUrl } = input;
  const party = [
    plural(r.adults, "adult", "adults"),
    r.children > 0 ? plural(r.children, "child", "children") : null,
  ]
    .filter(Boolean)
    .join(", ");
  const kind = r.item.type === "package" ? "Package" : "Tour";

  const subject = `New booking request ${reference}: ${oneLine(itemName, 60)}, ${formatDate(r.preferredDate)} (${party})`;

  const lines = [
    "A new booking request came in on the website. Nothing is confirmed or paid yet:",
    "please check availability and reply to the traveller with the final price.",
    "",
    `Reference:       ${reference}`,
    `${kind}:${" ".repeat(16 - kind.length)}${oneLine(itemName, 120)}`,
    `Preferred date:  ${formatDate(r.preferredDate)}`,
    `Travellers:      ${party}`,
    `Market:          ${marketLabels[r.market].long}`,
    `Currency:        ${r.currency}`,
    r.optionIds.length > 0
      ? `Options:         ${plural(r.optionIds.length, "option", "options")} chosen (see the admin page)`
      : null,
    "",
    `Name:            ${oneLine(r.customerName, 120)}`,
    `Email:           ${r.email}`,
    `Phone:           ${oneLine(r.phone, 40)}`,
    r.pickupLocation ? `Pickup:          ${oneLine(r.pickupLocation, 300)}` : null,
    "",
    r.message ? `Message from the traveller:\n${r.message.trim()}\n` : null,
    `Open it in the admin: ${adminUrl}`,
    "",
    "Replying to this email writes to the traveller directly.",
  ];
  return { subject, text: lines.filter((l) => l !== null).join("\n") };
}

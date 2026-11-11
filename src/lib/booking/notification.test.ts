import { describe, expect, it } from "vitest";

import { bookingNotification } from "./notification";
import type { BookingRequest } from "./request";

const request: BookingRequest = {
  item: { type: "tour", slug: "mnemba-island-snorkelling" },
  customerName: "Amina\r\nBcc: someone@example.com",
  email: "amina@example.com",
  phone: "+255 712 345 678",
  market: "resident",
  currency: "TZS",
  preferredDate: "2026-12-14",
  adults: 2,
  children: 1,
  pickupLocation: "Hotel in Paje",
  message: "We'd like an early start.",
  consent: "on",
  optionIds: [],
};

describe("bookingNotification", () => {
  const mail = bookingNotification({
    request,
    reference: "BTZ-2611-7F3A9C1E",
    itemName: "Mnemba Island Snorkelling",
    adminUrl: "https://example.com/admin/bookings/BTZ-2611-7F3A9C1E",
  });

  it("summarises the request in the subject", () => {
    expect(mail.subject).toBe(
      "New booking request BTZ-2611-7F3A9C1E: Mnemba Island Snorkelling, 14 December 2026 (2 adults, 1 child)",
    );
    expect(mail.subject).not.toMatch(/[\r\n]/);
  });

  it("includes contact details, the message and the admin link", () => {
    expect(mail.text).toContain("Email:           amina@example.com");
    expect(mail.text).toContain("Market:          Tanzanian residents");
    expect(mail.text).toContain("Pickup:          Hotel in Paje");
    expect(mail.text).toContain("We'd like an early start.");
    expect(mail.text).toContain("https://example.com/admin/bookings/BTZ-2611-7F3A9C1E");
  });

  it("keeps visitor-typed fields on one line", () => {
    expect(mail.text).toContain("Name:            Amina Bcc: someone@example.com");
  });

  it("leaves out empty optional fields", () => {
    const bare = bookingNotification({
      request: { ...request, pickupLocation: "", message: "", children: 0 },
      reference: "BTZ-2611-7F3A9C1E",
      itemName: "Mnemba Island Snorkelling",
      adminUrl: "https://example.com/x",
    });
    expect(bare.text).not.toContain("Pickup:");
    expect(bare.text).not.toContain("Message from the traveller");
    expect(bare.subject).toContain("(2 adults)");
  });
});

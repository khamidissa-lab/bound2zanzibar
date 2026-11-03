import { describe, expect, it } from "vitest";

import { escapeCsvCell, toCsv } from "@/lib/csv";

import { bookingQuery, parseBookingParams } from "./filters";
import { guestsLabel } from "./format";
import {
  addDays,
  BOOKING_REFERENCE_RE,
  bookingErrorMessage,
  bookingRequestSchema,
} from "./request";
import { canTransition, nextStatuses } from "./status";

const TODAY = "2026-11-02";
const schema = bookingRequestSchema(TODAY);

const valid = {
  item: "tour:prison-island-tour",
  customerName: "Amina Hassan",
  email: "Amina@Example.com ",
  phone: "+255 712 345 678",
  market: "international",
  currency: "USD",
  preferredDate: "2026-11-20",
  adults: "2",
  children: "1",
  pickupLocation: "",
  message: "",
  consent: "on",
};

const errorFor = (patch: Record<string, string | undefined>) => {
  const result = schema.safeParse({ ...valid, ...patch });
  return result.success ? null : result.error.issues.map((i) => String(i.path[0]));
};

describe("booking request validation", () => {
  it("accepts a valid request and normalises it", () => {
    const result = schema.parse(valid);
    expect(result.item).toEqual({ type: "tour", slug: "prison-island-tour" });
    expect(result.email).toBe("amina@example.com");
    expect(result.adults).toBe(2);
    expect(result.children).toBe(1);
  });

  it("rejects past, impossible and far-future dates", () => {
    expect(errorFor({ preferredDate: "2026-11-01" })).toEqual(["preferredDate"]);
    expect(errorFor({ preferredDate: "2026-02-30" })).toEqual(["preferredDate"]);
    expect(errorFor({ preferredDate: addDays(TODAY, 731) })).toEqual(["preferredDate"]);
    expect(errorFor({ preferredDate: "next tuesday" })).toEqual(["preferredDate"]);
    expect(errorFor({ preferredDate: TODAY })).toBeNull();
    expect(errorFor({ preferredDate: addDays(TODAY, 730) })).toBeNull();
  });

  it("rejects zero, negative and oversized parties", () => {
    expect(errorFor({ adults: "0" })).toEqual(["adults"]);
    expect(errorFor({ adults: "-1" })).toEqual(["adults"]);
    expect(errorFor({ adults: "1.5" })).toEqual(["adults"]);
    expect(errorFor({ adults: "51" })).toEqual(["adults"]);
    expect(errorFor({ children: "-2" })).toEqual(["children"]);
    expect(errorFor({ children: "0" })).toBeNull();
  });

  it("rejects malformed email and phone", () => {
    expect(errorFor({ email: "amina@" })).toEqual(["email"]);
    expect(errorFor({ email: "not an email" })).toEqual(["email"]);
    expect(errorFor({ phone: "12345" })).toEqual(["phone"]);
    expect(errorFor({ phone: "call me maybe" })).toEqual(["phone"]);
    expect(errorFor({ phone: "+-()- -()" })).toEqual(["phone"]);
  });

  it("requires a valid item, market, currency and consent", () => {
    expect(errorFor({ item: "" })).toEqual(["item"]);
    expect(errorFor({ item: "hotel:serena" })).toEqual(["item"]);
    expect(errorFor({ market: "mars" })).toEqual(["market"]);
    expect(errorFor({ currency: "EUR" })).toEqual(["currency"]);
    expect(errorFor({ consent: undefined })).toEqual(["consent"]);
  });

  it("maps database error keys to friendly messages", () => {
    expect(bookingErrorMessage("P0001: booking_rate_limited")).toMatch(/recently/);
    expect(bookingErrorMessage("connection refused")).toBeNull();
    expect(bookingErrorMessage(undefined)).toBeNull();
  });

  it("recognises booking references", () => {
    expect(BOOKING_REFERENCE_RE.test("BTZ-2611-7F3A9C1E")).toBe(true);
    expect(BOOKING_REFERENCE_RE.test("BTZ-2611-7f3a9c1e")).toBe(false);
    expect(BOOKING_REFERENCE_RE.test("<script>")).toBe(false);
  });
});

describe("booking status transitions", () => {
  it("allows the normal flow and reopening, but not skipping steps", () => {
    expect(canTransition("pending", "confirmed")).toBe(true);
    expect(canTransition("confirmed", "completed")).toBe(true);
    expect(canTransition("pending", "completed")).toBe(false);
    expect(canTransition("rejected", "confirmed")).toBe(false);
    expect(canTransition("rejected", "pending")).toBe(true);
    expect(canTransition("completed", "completed")).toBe(true);
    expect(nextStatuses("pending")).toEqual(["confirmed", "rejected", "cancelled"]);
  });
});

describe("booking list filters", () => {
  it("drops invalid values and round-trips valid ones", () => {
    const { filters, page } = parseBookingParams({
      status: "hacked",
      type: "package",
      from: "2026-12-01",
      to: "not-a-date",
      q: "  amina ",
      page: "-3",
    });
    expect(filters).toEqual({
      status: undefined,
      type: "package",
      q: "amina",
      from: "2026-12-01",
      to: undefined,
    });
    expect(page).toBe(1);
    expect(bookingQuery(filters, 2)).toBe("?type=package&q=amina&from=2026-12-01&page=2");
    expect(
      parseBookingParams(new URLSearchParams("status=pending&page=3")).filters.status,
    ).toBe("pending");
  });

  it("labels guests", () => {
    expect(guestsLabel(1, 0)).toBe("1 adult");
    expect(guestsLabel(2, 1)).toBe("2 adults, 1 child");
    expect(guestsLabel(2, 3)).toBe("2 adults, 3 children");
  });
});

describe("CSV export", () => {
  it("quotes special characters and neutralises formulas", () => {
    expect(escapeCsvCell('Say "hi", ok')).toBe('"Say ""hi"", ok"');
    expect(escapeCsvCell("line1\nline2")).toBe('"line1\nline2"');
    expect(escapeCsvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(escapeCsvCell("+255 712")).toBe("'+255 712");
    expect(escapeCsvCell("@cmd")).toBe("'@cmd");
    expect(escapeCsvCell(-5)).toBe("-5");
    expect(escapeCsvCell(null)).toBe("");
  });

  it("builds a UTF-8 CSV with a header row", () => {
    const csv = toCsv(
      [{ a: "Zoë", b: 2 }],
      [
        { header: "Name", value: (r) => r.a },
        { header: "Count", value: (r) => r.b },
      ],
    );
    expect(csv).toBe("﻿Name,Count\r\nZoë,2\r\n");
  });
});

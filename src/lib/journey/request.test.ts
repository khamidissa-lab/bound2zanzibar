import { describe, expect, it } from "vitest";

import { journeyErrorMessage, journeyRequestSchema } from "./request";

const today = "2026-11-07";
const base = {
  startDate: "2027-01-10",
  endDate: "2027-01-20",
  adults: "2",
  children: "0",
  accommodation: "mid_range",
  budgetAmount: "",
  budgetCurrency: "USD",
  specialRequirements: "",
  message: "",
  customerName: "Amina Said",
  email: "Amina@Example.com",
  phone: "",
  country: "",
  consent: "on",
};
const parse = (o: Record<string, unknown>) =>
  journeyRequestSchema(today).safeParse({ ...base, ...o });
const firstError = (o: Record<string, unknown>) => {
  const r = parse(o);
  return r.success
    ? null
    : { path: r.error.issues[0].path[0], message: r.error.issues[0].message };
};

describe("journeyRequestSchema", () => {
  it("accepts a complete request and normalises it", () => {
    const r = parse({
      destinations: ["stone-town"],
      interests: ["family"],
      flexibleDates: "on",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("amina@example.com");
      expect(r.data.adults).toBe(2);
      expect(r.data.flexibleDates).toBe(true);
    }
  });

  it("allows open dates", () => {
    expect(parse({ startDate: "", endDate: "" }).success).toBe(true);
  });

  it("checks the date order and length", () => {
    expect(firstError({ startDate: "2026-11-01" })?.message).toBe(
      "Choose a date from today onwards.",
    );
    expect(firstError({ endDate: "2027-01-05" })?.message).toBe(
      "The end date must be on or after the start date.",
    );
    expect(firstError({ endDate: "2027-05-01" })?.message).toBe(
      "Trips can be up to 90 days long.",
    );
    expect(firstError({ startDate: "", endDate: "2027-01-20" })?.path).toBe("startDate");
  });

  it("checks budget, slugs and consent", () => {
    expect(firstError({ budgetAmount: "-5" })?.path).toBe("budgetAmount");
    expect(firstError({ destinations: ["Not A Slug"] })?.path).toBe("destinations");
    expect(firstError({ consent: undefined })?.path).toBe("consent");
  });
});

describe("journeyErrorMessage", () => {
  it("maps database error keys to friendly text", () => {
    expect(journeyErrorMessage('new row violates "journey_invalid_dates"')).toBe(
      "Please check your travel dates.",
    );
    expect(journeyErrorMessage("something else")).toBeNull();
  });
});

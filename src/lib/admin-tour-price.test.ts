import { describe, expect, it } from "vitest";

import { adminFromPrice, type AdminPriceRow } from "./admin-tour-price";

const row = (patch: Partial<AdminPriceRow>): AdminPriceRow => ({
  market: "international",
  customer_type: "adult",
  currency: "USD",
  amount: 35,
  is_active: true,
  is_illustrative: false,
  ...patch,
});

describe("adminFromPrice", () => {
  it("prefers the lowest international adult price", () => {
    expect(
      adminFromPrice([
        row({ amount: 40 }),
        row({ amount: 35 }),
        row({ market: "resident", currency: "TZS", amount: 40000 }),
        row({ customer_type: "child", amount: 10 }),
      ]),
    ).toEqual({ amount: 35, currency: "USD", isExample: false });
  });

  it("falls back to another market's adult price, and skips inactive rows", () => {
    expect(
      adminFromPrice([
        row({ is_active: false, amount: 5 }),
        row({ market: "resident", currency: "TZS", amount: 40000 }),
      ]),
    ).toEqual({ amount: 40000, currency: "TZS", isExample: false });
  });

  it("marks example prices and returns null when there is none", () => {
    expect(adminFromPrice([row({ is_illustrative: true })])?.isExample).toBe(true);
    expect(adminFromPrice([row({ customer_type: "child" })])).toBeNull();
    expect(adminFromPrice([])).toBeNull();
  });
});

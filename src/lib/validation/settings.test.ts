import { describe, expect, it } from "vitest";

import { currencySchema } from "./settings";

const base = { code: "eur", name: "Euro", sortOrder: "3", isActive: "on" };

describe("currencySchema", () => {
  it("accepts and upper-cases a real ISO code", () => {
    expect(currencySchema.parse(base)).toEqual({
      code: "EUR",
      name: "Euro",
      sortOrder: 3,
      isActive: true,
    });
  });

  it("rejects made-up or malformed codes", () => {
    expect(currencySchema.safeParse({ ...base, code: "ABC" }).success).toBe(false);
    expect(currencySchema.safeParse({ ...base, code: "EU" }).success).toBe(false);
    expect(currencySchema.safeParse({ ...base, code: "E1R" }).success).toBe(false);
  });

  it("treats a missing checkbox as switched off", () => {
    const off = { code: base.code, name: base.name, sortOrder: base.sortOrder };
    expect(currencySchema.parse(off).isActive).toBe(false);
  });

  it("requires a name and a sensible order", () => {
    expect(currencySchema.safeParse({ ...base, name: " " }).success).toBe(false);
    expect(currencySchema.safeParse({ ...base, sortOrder: "-1" }).success).toBe(false);
  });
});

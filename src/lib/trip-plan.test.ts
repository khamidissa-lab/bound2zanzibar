import { describe, expect, it } from "vitest";

import { tripPlanFromParams, tripPlanQuery } from "./trip-plan";

const read = (qs: string) => {
  const params = new URLSearchParams(qs);
  return tripPlanFromParams((k) => params.get(k));
};

describe("trip plan", () => {
  it("keeps valid values and round-trips them", () => {
    const plan = read("date=2027-03-14&adults=4&children=2");
    expect(plan).toEqual({ date: "2027-03-14", adults: "4", children: "2" });
    expect(tripPlanQuery(plan)).toBe("date=2027-03-14&adults=4&children=2");
  });

  it("drops malformed or out-of-range values", () => {
    expect(read("date=14/03/2027&adults=0&children=-1")).toEqual({
      date: "",
      adults: "",
      children: "",
    });
    expect(read("adults=51&children=abc").adults).toBe("");
    expect(tripPlanQuery(read(""))).toBe("");
  });
});

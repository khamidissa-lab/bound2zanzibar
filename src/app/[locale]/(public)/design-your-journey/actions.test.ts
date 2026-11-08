import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const submit = vi.fn();
vi.mock("@/services/journeys", () => ({ submitJourneyRequest: submit }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));
vi.mock("@/services/admin-dashboard-model", () => ({ zanzibarDate: () => "2026-11-07" }));

const { requestJourney } = await import("./actions");

const fields = {
  locale: "fr",
  startDate: "2027-02-01",
  endDate: "2027-02-12",
  adults: "2",
  children: "1",
  accommodation: "luxury",
  budgetAmount: "3500",
  budgetCurrency: "USD",
  specialRequirements: "One vegetarian",
  message: "Beach and a short safari",
  customerName: "Amina Hassan",
  email: "amina@example.com",
  phone: "",
  country: "France",
  consent: "on",
};

function form(patch: Record<string, string> = {}, lists: Record<string, string[]> = {}) {
  const data = new FormData();
  for (const [k, v] of Object.entries({ ...fields, ...patch })) data.set(k, v);
  for (const [k, values] of Object.entries(lists))
    for (const v of values) data.append(k, v);
  return data;
}

const run = (data: FormData) => requestJourney({ status: "idle" }, data);

describe("requestJourney", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    submit.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("saves the request with every chosen destination and interest, in the page language", async () => {
    submit.mockResolvedValue({ ok: true, reference: "JRN-2611-ABCDEF12" });
    await expect(
      run(
        form(
          {},
          { destinations: ["stone-town", "mikumi"], interests: ["family", "safari"] },
        ),
      ),
    ).rejects.toThrow("REDIRECT:/fr/design-your-journey/received?ref=JRN-2611-ABCDEF12");
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({
        destinations: ["stone-town", "mikumi"],
        interests: ["family", "safari"],
        adults: 2,
        accommodation: "luxury",
      }),
      "fr",
    );
  });

  it("returns field errors and keeps the chosen lists", async () => {
    const state = await run(
      form({ endDate: "2027-01-20", email: "bad" }, { destinations: ["stone-town"] }),
    );
    expect(state.status).toBe("error");
    expect(state.fieldErrors).toMatchObject({
      endDate: "The end date must be on or after the start date.",
      email: "Enter a valid email address, like name@example.com.",
    });
    expect(state.values?.destinations).toBe("stone-town");
    expect(submit).not.toHaveBeenCalled();
  });

  it("shows a friendly message for database refusals", async () => {
    submit.mockResolvedValue({ ok: false, dbMessage: "journey_rate_limited" });
    const state = await run(form());
    expect(state.message).toMatch(/several requests/);
  });

  it("treats a filled honeypot as a bot", async () => {
    await expect(run(form({ website: "spam" }))).rejects.toThrow(
      "REDIRECT:/fr/design-your-journey/received",
    );
    expect(submit).not.toHaveBeenCalled();
  });
});

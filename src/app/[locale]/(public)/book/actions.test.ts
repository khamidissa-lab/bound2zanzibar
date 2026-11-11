import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const submit = vi.fn();
vi.mock("@/services/bookings", () => ({ submitBookingRequest: submit }));
const identify = vi.fn();
vi.mock("@/services/visitor-tracking", () => ({ identifyCurrentVisitor: identify }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));
const notify = vi.fn();
vi.mock("@/services/booking-notifications", () => ({ notifyTeamOfBooking: notify }));
// Run work scheduled with after() straight away so the test can see it.
vi.mock("next/server", () => ({ after: (task: () => unknown) => void task() }));
vi.mock("@/services/admin-dashboard-model", () => ({ zanzibarDate: () => "2026-11-02" }));

const { requestBooking } = await import("./actions");

const fields = {
  item: "package:zanzibar-highlights-4-days",
  customerName: "Amina Hassan",
  email: "amina@example.com",
  phone: "+255 712 345 678",
  market: "resident",
  currency: "TZS",
  preferredDate: "2026-12-01",
  adults: "2",
  children: "0",
  pickupLocation: "Stone Town",
  message: "",
  consent: "on",
};

function form(patch: Record<string, string> = {}) {
  const data = new FormData();
  for (const [k, v] of Object.entries({ ...fields, ...patch })) data.set(k, v);
  return data;
}

const run = (data: FormData) => requestBooking({ status: "idle" }, data);

describe("requestBooking", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    submit.mockReset();
    notify.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("saves a valid request and redirects to the received page with the reference", async () => {
    submit.mockResolvedValue({ ok: true, reference: "BTZ-2611-ABCDEF12" });
    await expect(run(form())).rejects.toThrow(
      "REDIRECT:/book/received?ref=BTZ-2611-ABCDEF12",
    );
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({
        item: { type: "package", slug: "zanzibar-highlights-4-days" },
        adults: 2,
        currency: "TZS",
      }),
    );
    // The visitor's own details are linked to their visitor record.
    expect(identify).toHaveBeenCalledWith({
      source: "booking",
      email: "amina@example.com",
      name: "Amina Hassan",
      phone: "+255 712 345 678",
      reference: "BTZ-2611-ABCDEF12",
      item: { type: "package", slug: "zanzibar-highlights-4-days" },
    });
    // The team is emailed about the saved request.
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ email: "amina@example.com", adults: 2 }),
      "BTZ-2611-ABCDEF12",
    );
  });

  it("returns field errors and keeps the typed values", async () => {
    const state = await run(form({ adults: "0", email: "bad" }));
    expect(state.status).toBe("error");
    expect(state.fieldErrors).toMatchObject({
      adults: expect.any(String),
      email: expect.any(String),
    });
    expect(state.values?.customerName).toBe("Amina Hassan");
    expect(submit).not.toHaveBeenCalled();
  });

  it("shows a friendly message for database rejections", async () => {
    submit.mockResolvedValue({ ok: false, dbMessage: "booking_item_unavailable" });
    const state = await run(form());
    expect(state.message).toMatch(/no longer available/);
    expect(notify).not.toHaveBeenCalled();
  });

  it("silently drops bot submissions caught by the honeypot", async () => {
    await expect(run(form({ website: "http://spam.example" }))).rejects.toThrow(
      "REDIRECT:/book/received",
    );
    expect(submit).not.toHaveBeenCalled();
  });

  it("explains that online requests are unavailable when the database isn't connected", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const state = await run(form());
    expect(state.status).toBe("error");
    expect(state.message).toMatch(/aren't available/);
    expect(submit).not.toHaveBeenCalled();
  });
});

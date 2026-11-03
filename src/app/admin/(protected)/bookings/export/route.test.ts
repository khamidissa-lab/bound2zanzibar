import { beforeEach, describe, expect, it, vi } from "vitest";

const access = vi.fn();
const exportBookings = vi.fn();
vi.mock("@/lib/auth/session", () => ({ getStaffAccess: access }));
vi.mock("@/services/bookings", () => ({ exportBookings }));
const logStaffEvent = vi.fn();
vi.mock("@/services/activity", () => ({ logStaffEvent }));

const { GET } = await import("./route");

const staff = (role: string) => ({
  kind: "ok",
  staff: { id: "u1", email: "s@example.com", fullName: "S", role },
});

const booking = {
  reference: "BTZ-2611-ABCDEF12",
  status: "pending",
  created_at: "2026-11-02T08:00:00Z",
  item_type: "tour",
  tour: { name: "Prison Island Tour", slug: "prison-island-tour" },
  package: null,
  preferred_date: "2026-12-01",
  adults: 2,
  children: 0,
  customer_name: "=cmd",
  email: "a@example.com",
  phone: "+255 712 345 678",
  market: "international",
  currency: "USD",
  quoted_total: 70,
  pickup_location: null,
  message: "Hello, world",
  internal_notes: null,
};

describe("GET /admin/bookings/export", () => {
  beforeEach(() => {
    exportBookings.mockReset().mockResolvedValue([booking]);
    logStaffEvent.mockReset();
  });

  it("requires a signed-in staff member", async () => {
    access.mockResolvedValue({ kind: "signed_out" });
    expect((await GET(new Request("http://x/admin/bookings/export"))).status).toBe(401);
  });

  it("is forbidden for roles without the export permission", async () => {
    for (const role of ["booking_staff", "content_editor"]) {
      access.mockResolvedValue(staff(role));
      expect((await GET(new Request("http://x/admin/bookings/export"))).status).toBe(403);
    }
    expect(exportBookings).not.toHaveBeenCalled();
    expect(logStaffEvent).not.toHaveBeenCalled();
  });

  it("downloads a CSV with the list filters applied for admins", async () => {
    access.mockResolvedValue(staff("admin"));
    const res = await GET(
      new Request("http://x/admin/bookings/export?status=pending&q=amina"),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    expect(res.headers.get("content-disposition")).toMatch(
      /attachment; filename="bookings-/,
    );
    expect(exportBookings).toHaveBeenCalledWith(
      expect.objectContaining({ status: "pending", q: "amina" }),
    );
    const body = await res.text();
    expect(body).toContain("BTZ-2611-ABCDEF12");
    expect(body).toContain("'=cmd");
    expect(body).toContain('"Hello, world"');
    // Logged without the search text, which may contain a customer's name.
    expect(logStaffEvent).toHaveBeenCalledWith("bookings_exported", {
      rows: 1,
      status: "pending",
    });
  });
});

import { describe, expect, it } from "vitest";

import { buildCustomers, filterCustomers } from "./customers";

const booking = (
  email: string,
  name: string,
  created_at: string,
  status = "pending",
  phone: string | null = null,
) => ({ email, customer_name: name, created_at, status, phone });

describe("buildCustomers", () => {
  it("groups bookings and enquiries by email, ignoring case", () => {
    const customers = buildCustomers(
      [
        booking("Amina@Example.com", "Amina", "2026-10-01T10:00:00Z", "confirmed"),
        booking(
          "amina@example.com",
          "Amina K.",
          "2026-10-05T10:00:00Z",
          "pending",
          "+255 700",
        ),
      ],
      [
        {
          email: "amina@example.com ",
          name: "Amina",
          phone: null,
          created_at: "2026-09-20T09:00:00Z",
        },
      ],
    );
    expect(customers).toEqual([
      {
        email: "amina@example.com",
        name: "Amina K.",
        phone: "+255 700",
        bookings: 2,
        confirmedBookings: 1,
        enquiries: 1,
        firstContact: "2026-09-20T09:00:00Z",
        lastContact: "2026-10-05T10:00:00Z",
      },
    ]);
  });

  it("orders customers by most recent contact", () => {
    const customers = buildCustomers(
      [
        booking("a@example.com", "A", "2026-10-01T00:00:00Z"),
        booking("b@example.com", "B", "2026-10-03T00:00:00Z"),
      ],
      [
        {
          email: "c@example.com",
          name: "C",
          phone: null,
          created_at: "2026-10-02T00:00:00Z",
        },
      ],
    );
    expect(customers.map((c) => c.name)).toEqual(["B", "C", "A"]);
  });

  it("keeps an earlier phone when the latest contact gave none", () => {
    const [c] = buildCustomers(
      [booking("a@example.com", "A", "2026-10-01T00:00:00Z", "pending", "+255 1")],
      [
        {
          email: "a@example.com",
          name: "A",
          phone: null,
          created_at: "2026-10-02T00:00:00Z",
        },
      ],
    );
    expect(c.phone).toBe("+255 1");
  });
});

describe("filterCustomers", () => {
  const all = buildCustomers(
    [
      booking(
        "amina@example.com",
        "Amina",
        "2026-10-01T00:00:00Z",
        "pending",
        "+255 700",
      ),
    ],
    [
      {
        email: "john@example.com",
        name: "John",
        phone: null,
        created_at: "2026-10-02T00:00:00Z",
      },
    ],
  );

  it("matches name, email or phone", () => {
    expect(filterCustomers(all, "JOHN").map((c) => c.name)).toEqual(["John"]);
    expect(filterCustomers(all, "255 7").map((c) => c.name)).toEqual(["Amina"]);
    expect(filterCustomers(all, "  ")).toHaveLength(2);
  });
});

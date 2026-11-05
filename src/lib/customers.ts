/**
 * Customers are not a separate table: they are the people behind booking
 * requests and contact-form enquiries, grouped by email address. Pure
 * functions so the grouping is unit-tested and shared with the preview.
 */

export type CustomerBookingInput = {
  customer_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  status: string;
};

export type CustomerEnquiryInput = {
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
};

export type Customer = {
  /** Lower-cased email: the grouping key. */
  email: string;
  name: string;
  phone: string | null;
  bookings: number;
  confirmedBookings: number;
  enquiries: number;
  firstContact: string;
  lastContact: string;
};

const key = (email: string) => email.trim().toLowerCase();

export function buildCustomers(
  bookings: CustomerBookingInput[],
  enquiries: CustomerEnquiryInput[],
): Customer[] {
  const byEmail = new Map<string, Customer>();
  const touch = (
    email: string,
    name: string,
    phone: string | null,
    at: string,
  ): Customer => {
    const k = key(email);
    const existing = byEmail.get(k);
    if (!existing) {
      const created: Customer = {
        email: k,
        name: name.trim(),
        phone: phone?.trim() || null,
        bookings: 0,
        confirmedBookings: 0,
        enquiries: 0,
        firstContact: at,
        lastContact: at,
      };
      byEmail.set(k, created);
      return created;
    }
    // The most recent contact decides the name; keep the latest phone given.
    if (at >= existing.lastContact) {
      existing.lastContact = at;
      existing.name = name.trim() || existing.name;
      existing.phone = phone?.trim() || existing.phone;
    } else if (!existing.phone && phone?.trim()) {
      existing.phone = phone.trim();
    }
    if (at < existing.firstContact) existing.firstContact = at;
    return existing;
  };

  for (const b of bookings) {
    const c = touch(b.email, b.customer_name, b.phone, b.created_at);
    c.bookings += 1;
    if (b.status === "confirmed" || b.status === "completed") c.confirmedBookings += 1;
  }
  for (const e of enquiries) {
    touch(e.email, e.name, e.phone, e.created_at).enquiries += 1;
  }

  return [...byEmail.values()].sort((a, b) =>
    a.lastContact < b.lastContact ? 1 : a.lastContact > b.lastContact ? -1 : 0,
  );
}

/** Case-insensitive match on name, email or phone. */
export function filterCustomers(customers: Customer[], q: string): Customer[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return customers;
  return customers.filter((c) =>
    [c.name, c.email, c.phone ?? ""].some((v) => v.toLowerCase().includes(needle)),
  );
}

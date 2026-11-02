import type { Enums } from "@/lib/supabase/database.types";

export type StaffRole = Enums<"staff_role">;

/**
 * App-level permission map. It mirrors the database role helpers in
 * supabase/migrations/…_rls_policies.sql (keep the two in sync). The UI uses it
 * to show or hide sections and server actions use it to fail fast with a clear
 * message — but the database RLS policies remain the real enforcement.
 */
export const PERMISSIONS = {
  "dashboard.view": ["super_admin", "admin", "content_editor", "booking_staff"],
  "content.manage": ["super_admin", "admin", "content_editor"],
  "content.delete": ["super_admin", "admin"],
  "prices.manage": ["super_admin", "admin"],
  "bookings.manage": ["super_admin", "admin", "booking_staff"],
  "bookings.export": ["super_admin", "admin"],
  "settings.manage": ["super_admin", "admin"],
  "staff.manage": ["super_admin"],
} as const satisfies Record<string, readonly StaffRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: StaffRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly StaffRole[]).includes(role);
}

export const ROLE_LABELS: Record<StaffRole, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  content_editor: "Content editor",
  booking_staff: "Booking staff",
};

export const ROLE_DESCRIPTIONS: Record<StaffRole, string> = {
  super_admin: "Full access, including staff accounts.",
  admin: "Content, prices, bookings and settings.",
  content_editor: "Tours, destinations, packages, guide articles, reviews and images.",
  booking_staff: "Booking requests and enquiries.",
};

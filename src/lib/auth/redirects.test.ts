import { describe, expect, it } from "vitest";

import { isPublicAdminPath, safeAdminPath } from "./redirects";

describe("safeAdminPath", () => {
  it.each([
    ["/admin", "/admin"],
    ["/admin/bookings", "/admin/bookings"],
    ["/admin/bookings?status=pending", "/admin/bookings?status=pending"],
  ])("keeps same-site admin path %s", (input, expected) => {
    expect(safeAdminPath(input)).toBe(expected);
  });

  it.each([
    null,
    "",
    "https://evil.example/admin",
    "//evil.example/admin",
    "/\\evil.example",
    "/admin\\..\\evil",
    "/administrator",
    "/tours",
    "javascript:alert(1)",
  ])("rejects %s", (input) => {
    expect(safeAdminPath(input)).toBe("/admin");
  });
});

describe("isPublicAdminPath", () => {
  it("allows only the sign-in related pages without a session", () => {
    expect(isPublicAdminPath("/admin/login")).toBe(true);
    expect(isPublicAdminPath("/admin/forgot-password")).toBe(true);
    expect(isPublicAdminPath("/admin/no-access")).toBe(true);
    expect(isPublicAdminPath("/admin")).toBe(false);
    expect(isPublicAdminPath("/admin/staff")).toBe(false);
    expect(isPublicAdminPath("/admin/login-as-admin")).toBe(false);
  });
});

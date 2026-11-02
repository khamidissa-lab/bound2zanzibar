import { describe, expect, it } from "vitest";

import {
  fieldErrors,
  inviteStaffSchema,
  loginSchema,
  newPasswordSchema,
  updateStaffSchema,
} from "./auth";

describe("loginSchema", () => {
  it("normalises the email", () => {
    const parsed = loginSchema.parse({ email: "  Staff@Example.COM ", password: "x" });
    expect(parsed.email).toBe("staff@example.com");
  });

  it("reports field errors", () => {
    const result = loginSchema.safeParse({ email: "nope", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error)).toEqual({
        email: "Enter a valid email address.",
        password: "Enter your password.",
      });
    }
  });
});

describe("newPasswordSchema", () => {
  it("requires 10+ characters and a matching confirmation", () => {
    expect(
      newPasswordSchema.safeParse({ password: "short", confirm: "short" }).success,
    ).toBe(false);
    const mismatch = newPasswordSchema.safeParse({
      password: "long enough phrase",
      confirm: "different phrase!",
    });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) expect(fieldErrors(mismatch.error).confirm).toBeDefined();
    expect(
      newPasswordSchema.safeParse({
        password: "long enough phrase",
        confirm: "long enough phrase",
      }).success,
    ).toBe(true);
  });
});

describe("staff schemas", () => {
  it("rejects unknown roles (never trust a role from the browser)", () => {
    expect(
      inviteStaffSchema.safeParse({ email: "a@b.co", fullName: "A", role: "owner" })
        .success,
    ).toBe(false);
  });

  it("parses updates", () => {
    const parsed = updateStaffSchema.parse({
      id: "00000000-0000-4000-8000-000000000001",
      role: "admin",
      isActive: "false",
    });
    expect(parsed.isActive).toBe(false);
    expect(
      updateStaffSchema.safeParse({ id: "not-a-uuid", role: "admin", isActive: "true" })
        .success,
    ).toBe(false);
  });
});

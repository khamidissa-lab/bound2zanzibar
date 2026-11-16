import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const verifyOtp = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({ auth: { verifyOtp } }),
}));

const { GET } = await import("./route");

// Behind Railway's proxy the request reaches the app as localhost:8080.
const internal = (query: string) =>
  new NextRequest(`http://localhost:8080/auth/confirm?${query}`);

describe("/auth/confirm", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://bound2zanzibar.co.tz");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    verifyOtp.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("sends a verified reset link to the account page on the public domain", async () => {
    verifyOtp.mockResolvedValue({ error: null });
    const res = await GET(internal("token_hash=abc&type=recovery&next=/admin/account"));
    expect(res.headers.get("location")).toBe(
      "https://bound2zanzibar.co.tz/admin/account?set_password=1",
    );
  });

  it("sends an expired link to the login page on the public domain", async () => {
    verifyOtp.mockResolvedValue({ error: { message: "expired" } });
    const res = await GET(internal("token_hash=abc&type=recovery"));
    expect(res.headers.get("location")).toBe(
      "https://bound2zanzibar.co.tz/admin/login?error=expired_link",
    );
  });

  it("never redirects outside the admin", async () => {
    verifyOtp.mockResolvedValue({ error: null });
    const res = await GET(
      internal("token_hash=abc&type=recovery&next=https://evil.example/x"),
    );
    expect(res.headers.get("location")).toBe(
      "https://bound2zanzibar.co.tz/admin/account?set_password=1",
    );
  });
});

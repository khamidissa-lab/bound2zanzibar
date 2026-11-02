import { describe, expect, it } from "vitest";

import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit per window, then resets", () => {
    const check = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(check("a", 0).ok).toBe(true);
    expect(check("a", 10).ok).toBe(true);
    const third = check("a", 20);
    expect(third.ok).toBe(false);
    expect(third.retryAfterS).toBe(1);
    expect(check("b", 20).ok).toBe(true);
    expect(check("a", 1000).ok).toBe(true);
  });
});

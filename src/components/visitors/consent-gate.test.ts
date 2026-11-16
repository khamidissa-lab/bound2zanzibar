import { describe, expect, it } from "vitest";

import { CONSENT_GATE_SCRIPT } from "./visitor-tracker";

/** Runs the inline gate script against a fake document. */
function gate(cookie: string): boolean {
  const attrs = new Set<string>();
  const document = {
    cookie,
    documentElement: { setAttribute: (name: string) => attrs.add(name) },
  };
  new Function("document", CONSENT_GATE_SCRIPT)(document);
  return attrs.has("data-consent-stored");
}

describe("CONSENT_GATE_SCRIPT", () => {
  it("marks the page when a choice is stored", () => {
    expect(gate("b2z_consent=accepted")).toBe(true);
    expect(gate("theme=x; b2z_consent=declined")).toBe(true);
  });

  it("leaves the banner visible when no choice is stored", () => {
    expect(gate("")).toBe(false);
    expect(gate("b2z_consent=maybe")).toBe(false);
    expect(gate("other_b2z_consent=accepted")).toBe(false);
  });
});

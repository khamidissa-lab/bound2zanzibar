import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { whatsappLink } from "@/config/site";

const submit = vi.fn();
vi.mock("@/services/enquiries", () => ({ submitEnquiry: submit }));
const identify = vi.fn();
vi.mock("@/services/visitor-tracking", () => ({ identifyCurrentVisitor: identify }));

const { sendEnquiry } = await import("./actions");

const fields = {
  name: "Amina Hassan",
  email: "Amina@Example.com",
  phone: "",
  subject: "Safari in March",
  message: "Is March a good month for a Ngorongoro day trip?",
  consent: "on",
};

function form(patch: Record<string, string> = {}) {
  const data = new FormData();
  for (const [k, v] of Object.entries({ ...fields, ...patch })) data.set(k, v);
  return data;
}

const run = (data: FormData) => sendEnquiry({ status: "idle" }, data);

describe("sendEnquiry", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    submit.mockReset().mockResolvedValue({ ok: true });
  });
  afterEach(() => vi.unstubAllEnvs());

  it("saves a valid message", async () => {
    const state = await run(form());
    expect(state.status).toBe("success");
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({ email: "amina@example.com", phone: "" }),
    );
  });

  it("rejects bad input and keeps what was typed", async () => {
    const state = await run(
      form({ email: "nope", message: "Hi", phone: "call me", consent: "" }),
    );
    expect(state.status).toBe("error");
    expect(Object.keys(state.fieldErrors ?? {}).sort()).toEqual([
      "consent",
      "email",
      "message",
      "phone",
    ]);
    expect(state.values?.subject).toBe("Safari in March");
    expect(submit).not.toHaveBeenCalled();
  });

  it("maps database rejections to friendly text", async () => {
    submit.mockResolvedValue({ ok: false, dbMessage: "inquiry_rate_limited" });
    expect((await run(form())).message).toMatch(/recently/);
  });

  it("drops honeypot submissions without saving", async () => {
    const state = await run(form({ website: "spam" }));
    expect(state.status).toBe("success");
    expect(submit).not.toHaveBeenCalled();
  });

  it("explains when the form isn't connected yet", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const state = await run(form());
    expect(state.message).toMatch(/isn't available/);
    expect(submit).not.toHaveBeenCalled();
  });
});

describe("whatsappLink", () => {
  it("uses the business number and encodes the message", () => {
    expect(whatsappLink()).toBe("https://wa.me/255622341233");
    expect(whatsappLink("Hi & hello?")).toBe(
      "https://wa.me/255622341233?text=Hi%20%26%20hello%3F",
    );
  });

  it("strips formatting from another number", () => {
    expect(whatsappLink(undefined, "+255 (712) 345-678")).toBe(
      "https://wa.me/255712345678",
    );
  });
});

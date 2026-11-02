import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sampleCategories } from "@/data/sample/categories";
import { sampleDestinations } from "@/data/sample/destinations";
import { samplePackages } from "@/data/sample/packages";
import { sampleTours } from "@/data/sample/tours";

// Stand-in for the Claude API: records the request and replays scripted events.
const calls: Record<string, unknown>[] = [];
let script: { texts: string[]; stopReason: string } = {
  texts: [],
  stopReason: "end_turn",
};

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    beta = {
      messages: {
        stream: (params: Record<string, unknown>) => {
          calls.push(params);
          const { texts, stopReason } = script;
          return {
            async *[Symbol.asyncIterator]() {
              for (const text of texts) {
                yield {
                  type: "content_block_delta",
                  delta: { type: "text_delta", text },
                };
              }
            },
            finalMessage: async () => ({ stop_reason: stopReason }),
            abort: () => {},
          };
        },
      },
    };
  },
}));

vi.mock("@/services/content", () => ({
  getTours: async () => sampleTours,
  getPackages: async () => samplePackages,
  getDestinations: async () => sampleDestinations,
  getCategories: async () => sampleCategories,
}));

let ip = 0;
function post(body: unknown, sameIp?: string) {
  return new Request("http://localhost/api/assistant", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": sameIp ?? `10.0.0.${++ip}`,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const question = { messages: [{ role: "user", content: "What does it cost?" }] };

describe("POST /api/assistant", () => {
  beforeEach(() => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    calls.length = 0;
    script = { texts: [], stopReason: "end_turn" };
  });
  afterEach(() => vi.unstubAllEnvs());

  it("answers 503 when no API key is configured", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const { POST } = await import("./route");
    const res = await POST(post(question));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "not_configured" });
    expect(calls).toHaveLength(0);
  });

  it("rejects invalid bodies without calling the model", async () => {
    const { POST } = await import("./route");
    expect((await POST(post("not json"))).status).toBe(400);
    expect(
      (await POST(post({ messages: [{ role: "system", content: "x" }] }))).status,
    ).toBe(400);
    expect((await POST(post({ ...question, page: "https://evil.example" }))).status).toBe(
      400,
    );
    expect(calls).toHaveLength(0);
  });

  it("streams the answer and sends grounded, cached context", async () => {
    script.texts = ["Prison Island is ", "USD 35 per person."];
    const { POST } = await import("./route");
    const res = await POST(post({ ...question, page: "/tours/prison-island-tour" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    expect(await res.text()).toBe("Prison Island is USD 35 per person.");

    const params = calls[0] as {
      model: string;
      system: { text: string; cache_control: unknown }[];
      messages: { role: string; content: string }[];
    };
    expect(params.model).toBe("claude-opus-5-5");
    expect(params.system[0].cache_control).toEqual({ type: "ephemeral" });
    expect(params.system[0].text).toContain("Page: /tours/prison-island-tour");
    expect(params.messages.at(-1)).toEqual({
      role: "system",
      content: expect.stringContaining('"Prison Island Tour"'),
    });
  });

  it("omits the page note for unknown pages", async () => {
    script.texts = ["Hi"];
    const { POST } = await import("./route");
    await (await POST(post({ ...question, page: "/tours/not-a-tour" }))).text();
    const params = calls[0] as { messages: { role: string }[] };
    expect(params.messages.map((m) => m.role)).toEqual(["user"]);
  });

  it("replaces an empty refusal with a polite pointer to the team", async () => {
    script.stopReason = "refusal";
    const { POST } = await import("./route");
    const text = await (await POST(post(question))).text();
    expect(text).toContain("contact our team");
  });

  it("rate limits a visitor who sends too many questions", async () => {
    script.texts = ["ok"];
    const { POST } = await import("./route");
    const statuses: number[] = [];
    for (let i = 0; i < 9; i++) {
      const res = await POST(post(question, "203.0.113.9"));
      statuses.push(res.status);
      await res.text().catch(() => {});
    }
    expect(statuses.slice(0, 8).every((s) => s === 200)).toBe(true);
    expect(statuses[8]).toBe(429);
  });
});

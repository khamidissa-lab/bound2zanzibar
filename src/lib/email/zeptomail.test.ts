import { describe, expect, it } from "vitest";

import { parseMailbox, zeptoAuthHeader, zeptoPayload } from "./zeptomail";

describe("parseMailbox", () => {
  it("reads 'Name <address>' and bare addresses", () => {
    expect(parseMailbox("Bound2Zanzibar Website <info@bound2zanzibar.co.tz>")).toEqual({
      name: "Bound2Zanzibar Website",
      address: "info@bound2zanzibar.co.tz",
    });
    expect(parseMailbox('"Quoted Name" <a@b.co>')).toEqual({
      name: "Quoted Name",
      address: "a@b.co",
    });
    expect(parseMailbox(" info@bound2zanzibar.co.tz ")).toEqual({
      address: "info@bound2zanzibar.co.tz",
    });
  });

  it("rejects values that are not an address", () => {
    expect(parseMailbox("")).toBeNull();
    expect(parseMailbox("Bound2Zanzibar")).toBeNull();
  });
});

describe("zeptoAuthHeader", () => {
  it("adds the scheme once, whether or not the token already has it", () => {
    expect(zeptoAuthHeader("abc123")).toBe("Zoho-enczapikey abc123");
    expect(zeptoAuthHeader("Zoho-enczapikey abc123")).toBe("Zoho-enczapikey abc123");
  });
});

describe("zeptoPayload", () => {
  it("builds the ZeptoMail request body", () => {
    expect(
      zeptoPayload({
        from: { address: "info@bound2zanzibar.co.tz", name: "Website" },
        to: "booking@bound2zanzibar.co.tz",
        subject: "New booking request",
        text: "Details",
        replyTo: "amina@example.com",
      }),
    ).toEqual({
      from: { address: "info@bound2zanzibar.co.tz", name: "Website" },
      to: [{ email_address: { address: "booking@bound2zanzibar.co.tz" } }],
      reply_to: [{ address: "amina@example.com" }],
      subject: "New booking request",
      textbody: "Details",
    });
  });

  it("leaves out reply_to when there is none", () => {
    const body = zeptoPayload({
      from: { address: "a@b.co" },
      to: "c@d.co",
      subject: "s",
      text: "t",
    });
    expect(body).not.toHaveProperty("reply_to");
  });
});

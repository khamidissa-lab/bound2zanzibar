/**
 * Zoho ZeptoMail: transactional email over HTTPS. Used where the host blocks
 * SMTP (Railway allows SMTP only on its Pro plan). Server-only settings:
 *
 *   ZEPTOMAIL_TOKEN    the "Send Mail token" from ZeptoMail → Mail Agents →
 *                      SMTP/API (with or without the "Zoho-enczapikey " prefix)
 *   ZEPTOMAIL_API_URL  optional; defaults to the US data centre endpoint.
 *                      EU accounts use https://api.zeptomail.eu/v1.1/email
 *   EMAIL_FROM         a sender on a domain verified in ZeptoMail,
 *                      e.g. "Bound2Zanzibar Website <info@bound2zanzibar.co.tz>"
 */

export const ZEPTOMAIL_DEFAULT_URL = "https://api.zeptomail.com/v1.1/email";

export type Mailbox = { address: string; name?: string };

/** `Name <address>` or a bare address. */
export function parseMailbox(value: string): Mailbox | null {
  const trimmed = value.trim();
  const angled = trimmed.match(/^(.*?)\s*<([^<>\s]+@[^<>\s]+)>$/);
  if (angled) {
    const name = angled[1].trim().replace(/^"(.*)"$/, "$1");
    return name ? { address: angled[2], name } : { address: angled[2] };
  }
  return /^[^\s<>]+@[^\s<>]+$/.test(trimmed) ? { address: trimmed } : null;
}

export function zeptoAuthHeader(token: string): string {
  return `Zoho-enczapikey ${token.trim().replace(/^Zoho-enczapikey\s+/i, "")}`;
}

export function zeptoPayload(input: {
  from: Mailbox;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  return {
    from: input.from,
    to: [{ email_address: { address: input.to } }],
    ...(input.replyTo ? { reply_to: [{ address: input.replyTo }] } : {}),
    subject: input.subject,
    textbody: input.text,
  };
}

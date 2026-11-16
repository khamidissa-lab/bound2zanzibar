import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

import {
  parseMailbox,
  ZEPTOMAIL_DEFAULT_URL,
  zeptoAuthHeader,
  zeptoPayload,
} from "./zeptomail";

/**
 * Outgoing email through the business mailbox's SMTP server (Zoho Mail).
 *
 * Configured only by server environment variables; nothing here is ever sent
 * to the browser. When the settings are missing, sending is skipped and the
 * caller carries on (a booking request is saved either way).
 */

type SmtpSettings = {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
};

export function smtpSettings(env: NodeJS.ProcessEnv = process.env): SmtpSettings | null {
  const host = env.SMTP_HOST?.trim();
  const user = env.SMTP_USER?.trim();
  const password = env.SMTP_PASSWORD;
  if (!host || !user || !password) return null;
  const port = Number(env.SMTP_PORT || 465);
  return {
    host,
    port: Number.isInteger(port) && port > 0 ? port : 465,
    user,
    password,
    // Must be the mailbox itself or one of its aliases, or Zoho rejects it.
    from: env.EMAIL_FROM?.trim() || user,
  };
}

export function isEmailConfigured(): boolean {
  return smtpSettings() !== null;
}

let cached: { key: string; transporter: Transporter } | null = null;

function transporterFor(s: SmtpSettings): Transporter {
  const key = `${s.host}:${s.port}:${s.user}`;
  if (cached?.key !== key) {
    cached = {
      key,
      transporter: nodemailer.createTransport({
        host: s.host,
        port: s.port,
        // 465 is TLS from the start; 587 upgrades with STARTTLS.
        secure: s.port === 465,
        requireTLS: s.port !== 465,
        auth: { user: s.user, pass: s.password },
        connectionTimeout: 15_000,
        greetingTimeout: 15_000,
        socketTimeout: 20_000,
        // Plain text only: never read files or fetch URLs while building mail.
        disableFileAccess: true,
        disableUrlAccess: true,
      }),
    };
  }
  return cached.transporter;
}

export type OutgoingEmail = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export type SendResult = "sent" | "not_configured" | "failed";

/** Sends through ZeptoMail's HTTPS API (for hosts that block SMTP). */
async function sendWithZeptoMail(
  email: OutgoingEmail,
  token: string,
): Promise<SendResult> {
  const from = parseMailbox(process.env.EMAIL_FROM ?? "");
  if (!from) {
    console.error("[email] EMAIL_FROM is missing or not an email address");
    return "not_configured";
  }
  try {
    const response = await fetch(
      process.env.ZEPTOMAIL_API_URL?.trim() || ZEPTOMAIL_DEFAULT_URL,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: zeptoAuthHeader(token),
        },
        body: JSON.stringify(zeptoPayload({ from, ...email })),
        signal: AbortSignal.timeout(20_000),
      },
    );
    if (response.ok) return "sent";
    // The error body names the problem (e.g. unverified sender); it holds no secrets.
    const detail = (await response.text().catch(() => "")).slice(0, 300);
    console.error(
      `[email] ZeptoMail refused "${email.subject}": ${response.status} ${detail}`,
    );
    return "failed";
  } catch (error) {
    console.error(
      `[email] ZeptoMail request for "${email.subject}" failed: ${(error as Error).message}`,
    );
    return "failed";
  }
}

/**
 * Sends one plain-text email: through ZeptoMail when ZEPTOMAIL_TOKEN is set,
 * otherwise through SMTP. Never throws; failures are logged without secrets.
 */
export async function sendEmail(email: OutgoingEmail): Promise<SendResult> {
  const zeptoToken = process.env.ZEPTOMAIL_TOKEN?.trim();
  if (zeptoToken) return sendWithZeptoMail(email, zeptoToken);
  const settings = smtpSettings();
  if (!settings) return "not_configured";
  try {
    await transporterFor(settings).sendMail({
      from: settings.from,
      to: email.to,
      replyTo: email.replyTo,
      subject: email.subject,
      text: email.text,
    });
    return "sent";
  } catch (error) {
    const e = error as { code?: string; responseCode?: number; message?: string };
    console.error(
      `[email] sending "${email.subject}" failed: ${e.code ?? ""} ${e.responseCode ?? ""} ${e.message ?? ""}`.trim(),
    );
    return "failed";
  }
}

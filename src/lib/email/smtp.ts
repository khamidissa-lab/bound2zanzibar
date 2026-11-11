import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

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

/** Sends one plain-text email. Never throws; failures are logged without secrets. */
export async function sendEmail(email: OutgoingEmail): Promise<SendResult> {
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

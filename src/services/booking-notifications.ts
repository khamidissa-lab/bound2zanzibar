import "server-only";

import { contact } from "@/config/site";
import { bookingNotification } from "@/lib/booking/notification";
import type { BookingRequest } from "@/lib/booking/request";
import { sendEmail, type SendResult } from "@/lib/email/smtp";
import { getSiteUrl } from "@/lib/site-url";
import { getPackageBySlug, getTourBySlug } from "@/services/content";

/** Where new booking requests are announced (booking@ unless overridden). */
export function bookingNotifyAddress(): string {
  return process.env.BOOKING_NOTIFY_EMAIL?.trim() || contact.bookingEmail;
}

/**
 * Emails the team about a booking request that has already been saved.
 * Never throws: the request is in the admin either way.
 */
export async function notifyTeamOfBooking(
  request: BookingRequest,
  reference: string,
): Promise<SendResult> {
  try {
    const item =
      request.item.type === "package"
        ? await getPackageBySlug(request.item.slug)
        : await getTourBySlug(request.item.slug);
    const adminUrl = new URL(
      `/admin/bookings/${encodeURIComponent(reference)}`,
      getSiteUrl(),
    ).toString();
    const { subject, text } = bookingNotification({
      request,
      reference,
      itemName: item?.name ?? request.item.slug,
      adminUrl,
    });
    const result = await sendEmail({
      to: bookingNotifyAddress(),
      subject,
      text,
      replyTo: request.email,
    });
    if (result === "not_configured") {
      console.warn(
        `[booking] ${reference} saved; no email sent because SMTP is not configured`,
      );
    }
    return result;
  } catch (error) {
    console.error(
      `[booking] ${reference} saved; notification failed:`,
      (error as Error).message,
    );
    return "failed";
  }
}

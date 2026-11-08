import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail, MessageCircle, Phone } from "lucide-react";

import { whatsappLink } from "@/config/site";
import { formatReceived, guestsLabel, itemName } from "@/lib/booking/format";
import { formatDate, formatPrice, marketLabels } from "@/lib/format";
import { STATUS_LABELS } from "@/services/admin-dashboard-model";
import type { BookingDetail, BookingEvent, BookingPayment } from "@/services/bookings";
import type { Currency } from "@/types/content";

import { BookingStatusBadge } from "./booking-badge";
import { BookingPayments } from "./booking-payments";
import { ReviewLink } from "./review-link";
import { BookingStatusForm } from "./booking-status-form";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-2.5 sm:grid-cols-[10rem_minmax(0,1fr)]">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words text-ocean-deep">{children}</dd>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 sm:p-6">
      <h2 className="font-display text-lg text-ocean-deep">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export function BookingDetailView({
  backHref,
  booking,
  events,
  canEdit,
  payments = [],
  currencies = ["USD", "TZS"],
  today,
  canDeletePayments = false,
  siteUrl,
  preview = false,
}: {
  backHref: string;
  booking: BookingDetail;
  events: BookingEvent[];
  canEdit: boolean;
  payments?: BookingPayment[];
  currencies?: string[];
  /** Today in Zanzibar ("YYYY-MM-DD"), the latest allowed payment date. */
  today: string;
  canDeletePayments?: boolean;
  /** Public site address, for the review link. */
  siteUrl?: string;
  preview?: boolean;
}) {
  const item = booking.tour ?? booking.package;
  const publicHref = item
    ? `/${booking.item_type === "tour" ? "tours" : "packages"}/${item.slug}`
    : null;

  return (
    <div className="max-w-6xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-turquoise-deep hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All bookings
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-semibold tracking-wide text-ocean-deep sm:text-3xl">
          {booking.reference}
        </h1>
        <BookingStatusBadge status={booking.status} className="text-sm" />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Received {formatReceived(booking.created_at)} via {booking.source}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <Card title="Trip">
            <dl className="divide-y">
              <Row label={booking.item_type === "tour" ? "Tour" : "Package"}>
                {itemName(booking)}
                {publicHref ? (
                  <Link
                    href={publicHref}
                    target="_blank"
                    className="ml-2 inline-flex items-center gap-1 text-xs text-turquoise-deep hover:underline"
                  >
                    View page
                    <ExternalLink className="size-3" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </Link>
                ) : null}
              </Row>
              <Row label="Preferred date">{formatDate(booking.preferred_date)}</Row>
              <Row label="Guests">{guestsLabel(booking.adults, booking.children)}</Row>
              <Row label="Market">{marketLabels[booking.market].long}</Row>
              <Row label="Estimate at request">
                {booking.quoted_total !== null ? (
                  <>
                    {formatPrice(booking.quoted_total, booking.currency as Currency)}
                    <span className="block text-xs text-muted-foreground">
                      Snapshot of the website prices when the request was sent — not a
                      confirmed price.
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    No online price for {booking.currency} — quote the customer directly.
                  </span>
                )}
              </Row>
              {booking.options && booking.options.length > 0 ? (
                <Row label="Options">
                  <ul className="space-y-1">
                    {booking.options.map((o) => (
                      <li key={o.name}>
                        {o.name}
                        <span className="text-muted-foreground">
                          {" "}
                          ·{" "}
                          {o.total !== null
                            ? formatPrice(o.total, booking.currency as Currency)
                            : "price on request"}
                          {o.pricing === "per_person"
                            ? " (per person)"
                            : " (per booking)"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Row>
              ) : null}
              <Row label="Pickup">{booking.pickup_location || "—"}</Row>
            </dl>
          </Card>

          <Card title="Customer">
            <dl className="divide-y">
              <Row label="Name">{booking.customer_name}</Row>
              <Row label="Email">
                <a
                  href={`mailto:${booking.email}?subject=${encodeURIComponent(`Your booking request ${booking.reference}`)}`}
                  className="inline-flex items-center gap-1.5 text-turquoise-deep hover:underline"
                >
                  <Mail className="size-3.5" aria-hidden="true" />
                  {booking.email}
                </a>
              </Row>
              <Row label="Phone">
                <a
                  href={`tel:${booking.phone.replace(/[^\d+]/g, "")}`}
                  className="inline-flex items-center gap-1.5 text-turquoise-deep hover:underline"
                >
                  <Phone className="size-3.5" aria-hidden="true" />
                  {booking.phone}
                </a>
                <a
                  href={whatsappLink(
                    `Hello ${booking.customer_name}, this is Bound to Zanzibar about your booking request ${booking.reference}.`,
                    booking.phone,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 inline-flex items-center gap-1 text-xs text-turquoise-deep hover:underline"
                >
                  <MessageCircle className="size-3.5" aria-hidden="true" />
                  Open in WhatsApp
                </a>
              </Row>
            </dl>
          </Card>

          <Card title="Message from the customer">
            {booking.message ? (
              <p className="text-sm whitespace-pre-wrap text-ocean-deep">
                {booking.message}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No message.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={canEdit ? "Update booking" : "Status"}>
            {canEdit ? (
              <BookingStatusForm
                bookingId={booking.id}
                status={booking.status}
                internalNotes={booking.internal_notes ?? ""}
                disabled={preview}
              />
            ) : (
              <BookingStatusBadge status={booking.status} />
            )}
          </Card>

          {canEdit &&
          booking.status === "completed" &&
          booking.review_token &&
          siteUrl ? (
            <Card title="Review link">
              <ReviewLink
                url={`${siteUrl}/review/${booking.review_token}`}
                customerName={booking.customer_name}
                email={booking.email}
                phone={booking.phone}
                reference={booking.reference}
              />
            </Card>
          ) : null}

          {canEdit ? (
            <Card title="Payments">
              <BookingPayments
                bookingId={booking.id}
                currency={booking.currency}
                quotedTotal={booking.quoted_total}
                payments={payments}
                currencies={currencies}
                today={today}
                canDelete={canDeletePayments}
                disabled={preview}
              />
            </Card>
          ) : null}

          <Card title="History">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No status changes recorded.</p>
            ) : (
              <ol className="space-y-3">
                {events.map((e, i) => (
                  <li
                    key={i}
                    className="relative border-l-2 border-turquoise/40 pl-4 text-sm"
                  >
                    <p className="text-ocean-deep">
                      {e.from_status
                        ? `${STATUS_LABELS[e.from_status]} → ${STATUS_LABELS[e.to_status]}`
                        : `Request received (${STATUS_LABELS[e.to_status].toLowerCase()})`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatReceived(e.created_at)}
                      {e.changed_by
                        ? ` · ${e.changed_by}`
                        : e.from_status
                          ? ""
                          : " · website"}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";

import { addPayment, removePayment } from "@/app/admin/_actions/bookings";
import { EditorForm, SaveButton } from "@/components/admin/editor-controls";
import { FormMessage } from "@/components/admin/form-controls";
import { Button } from "@/components/ui/button";
import { initialFormState } from "@/lib/forms";
import { formatDate, formatPrice } from "@/lib/format";
import type { BookingPayment } from "@/services/bookings";
import type { Currency } from "@/types/content";

const METHOD_LABELS: Record<BookingPayment["method"], string> = {
  bank_transfer: "Bank transfer",
  mobile_money: "Mobile money",
  card: "Card",
  cash: "Cash",
  other: "Other",
};

const field =
  "h-10 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-ocean-deep";

/**
 * Payments the team has verified and recorded. Nothing is charged online; a
 * booking can only be marked paid once these cover its quote.
 */
export function BookingPayments({
  bookingId,
  currency,
  quotedTotal,
  payments,
  currencies,
  today,
  canDelete,
  disabled = false,
}: {
  bookingId: string;
  currency: string;
  quotedTotal: number | null;
  payments: BookingPayment[];
  currencies: string[];
  today: string;
  canDelete: boolean;
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState(addPayment, initialFormState);
  const [removeState, remove] = useActionState(removePayment, initialFormState);
  const money = (amount: number, c: string) => formatPrice(amount, c as Currency);
  const received = payments
    .filter((p) => p.currency === currency)
    .reduce((sum, p) => sum + p.amount, 0);
  const otherCurrencies = payments.some((p) => p.currency !== currency);
  const values = state.status === "error" ? (state.values ?? {}) : {};
  const e = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-muted/50 p-3">
          <dt className="text-xs text-muted-foreground">Received ({currency})</dt>
          <dd className="font-semibold text-ocean-deep">{money(received, currency)}</dd>
        </div>
        <div className="rounded-xl bg-muted/50 p-3">
          <dt className="text-xs text-muted-foreground">Balance</dt>
          <dd className="font-semibold text-ocean-deep">
            {quotedTotal === null
              ? "No quote"
              : money(Math.max(0, quotedTotal - received), currency)}
          </dd>
        </div>
      </dl>
      {otherCurrencies ? (
        <p className="text-xs text-muted-foreground">
          Payments in other currencies are listed but not counted towards the {currency}{" "}
          balance; currencies are never converted.
        </p>
      ) : null}

      <FormMessage state={removeState} />
      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No payments recorded.</p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {payments.map((p) => (
            <li key={p.id} className="flex items-start gap-3 p-3 text-sm">
              <div className="flex-1">
                <p className="font-medium text-ocean-deep">
                  {money(p.amount, p.currency)} · {METHOD_LABELS[p.method]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(p.paid_on)}
                  {p.reference ? ` · Ref ${p.reference}` : ""}
                  {p.recorded_by ? ` · recorded by ${p.recorded_by}` : ""}
                </p>
                {p.notes ? <p className="mt-1 text-xs">{p.notes}</p> : null}
              </div>
              {canDelete && !disabled ? (
                <form action={remove}>
                  <input type="hidden" name="paymentId" value={p.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove payment of ${money(p.amount, p.currency)} on ${formatDate(p.paid_on)}`}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {disabled ? null : (
        <EditorForm action={action} className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium">Record a payment</p>
          <p className="text-xs text-muted-foreground">
            Only record money you have seen arrive (bank statement, mobile money
            confirmation, card terminal receipt).
          </p>
          <FormMessage state={state} />
          <input type="hidden" name="bookingId" value={bookingId} />
          <div className="grid grid-cols-[1fr_6rem] gap-2">
            <label className="text-xs text-muted-foreground">
              Amount
              <input
                name="amount"
                inputMode="decimal"
                required
                defaultValue={values.amount}
                aria-invalid={e.amount ? true : undefined}
                className={field}
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Currency
              <select
                name="currency"
                defaultValue={values.currency ?? currency}
                className={field}
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {e.amount ? <p className="text-xs text-destructive">{e.amount}</p> : null}
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-muted-foreground">
              Method
              <select
                name="method"
                defaultValue={values.method ?? "bank_transfer"}
                className={field}
              >
                {Object.entries(METHOD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted-foreground">
              Date received
              <input
                type="date"
                name="paidOn"
                max={today}
                required
                defaultValue={values.paidOn ?? today}
                aria-invalid={e.paidOn ? true : undefined}
                className={field}
              />
            </label>
          </div>
          {e.paidOn ? <p className="text-xs text-destructive">{e.paidOn}</p> : null}
          <label className="block text-xs text-muted-foreground">
            Reference (optional)
            <input
              name="reference"
              maxLength={120}
              defaultValue={values.reference}
              placeholder="e.g. transaction ID"
              className={field}
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Notes (optional)
            <input
              name="notes"
              maxLength={1000}
              defaultValue={values.notes}
              className={field}
            />
          </label>
          <SaveButton pending={pending}>Record payment</SaveButton>
        </EditorForm>
      )}
    </div>
  );
}

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Check, EyeOff, Star, Trash2 } from "lucide-react";

import { moderateReview, removeReview } from "@/app/admin/_actions/reviews";
import { FormMessage } from "@/components/admin/form-controls";
import { Button } from "@/components/ui/button";
import { formatReceived } from "@/lib/booking/format";
import { initialFormState } from "@/lib/forms";
import { cn } from "@/lib/utils";
import type { AdminReview } from "@/services/reviews";

/** One review with publish / hide / delete controls. */
export function ReviewModerationCard({ review }: { review: AdminReview }) {
  const [moderated, moderate, moderating] = useActionState(
    moderateReview,
    initialFormState,
  );
  const [deleted, remove, deleting] = useActionState(removeReview, initialFormState);
  const item = review.tour ?? review.package;
  const itemHref = review.tour
    ? `/tours/${review.tour.slug}`
    : review.package
      ? `/packages/${review.package.slug}`
      : null;

  return (
    <article className="rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span
          role="img"
          aria-label={`${review.rating} out of 5 stars`}
          className="inline-flex gap-0.5"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              aria-hidden="true"
              className={cn(
                "size-4",
                n <= review.rating ? "fill-gold text-gold" : "text-ocean-deep/25",
              )}
            />
          ))}
        </span>
        <span className="text-sm text-muted-foreground">
          {formatReceived(review.created_at)}
        </span>
      </div>
      {review.title ? (
        <h2 className="mt-2 font-display text-xl text-ocean-deep">{review.title}</h2>
      ) : null}
      <p className="mt-2 text-sm whitespace-pre-wrap text-ocean-deep">{review.body}</p>
      <p className="mt-3 text-sm text-muted-foreground">
        <span className="font-medium text-ocean-deep">{review.display_name}</span>
        {review.country ? ` · ${review.country}` : ""}
        {item ? (
          <>
            {" · "}
            {itemHref ? (
              <a
                href={itemHref}
                target="_blank"
                className="text-turquoise-deep hover:underline"
              >
                {item.name}
              </a>
            ) : (
              item.name
            )}
          </>
        ) : null}
        {review.booking ? (
          <>
            {" · booking "}
            <Link
              href={`/admin/bookings/${review.booking.reference}`}
              className="font-mono text-turquoise-deep hover:underline"
            >
              {review.booking.reference}
            </Link>
          </>
        ) : null}
      </p>

      <FormMessage state={moderated} />
      <FormMessage state={deleted} />
      <div className="mt-4 flex flex-wrap gap-2">
        {review.status !== "approved" ? (
          <form action={moderate}>
            <input type="hidden" name="id" value={review.id} />
            <input type="hidden" name="status" value="approved" />
            <Button type="submit" size="sm" disabled={moderating}>
              <Check aria-hidden="true" data-icon="inline-start" />
              Publish
            </Button>
          </form>
        ) : null}
        {review.status !== "rejected" ? (
          <form action={moderate}>
            <input type="hidden" name="id" value={review.id} />
            <input type="hidden" name="status" value="rejected" />
            <Button type="submit" size="sm" variant="outline" disabled={moderating}>
              <EyeOff aria-hidden="true" data-icon="inline-start" />
              {review.status === "approved" ? "Unpublish" : "Don't publish"}
            </Button>
          </form>
        ) : null}
        <form
          action={remove}
          onSubmit={(e) => {
            if (!window.confirm("Delete this review permanently?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={review.id} />
          <Button type="submit" size="sm" variant="ghost" disabled={deleting}>
            <Trash2 aria-hidden="true" data-icon="inline-start" />
            Delete
          </Button>
        </form>
      </div>
    </article>
  );
}

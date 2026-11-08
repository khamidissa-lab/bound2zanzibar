import type { Metadata } from "next";
import Link from "next/link";

import { AccessDenied } from "@/components/admin/admin-states";
import { ReviewModerationCard } from "@/components/admin/reviews/review-moderation";
import { requireStaffPage } from "@/lib/auth/session";
import {
  REVIEW_STATUS_LABELS,
  REVIEW_STATUSES,
  type ReviewStatus,
} from "@/lib/review/request";
import { cn } from "@/lib/utils";
import { countReviewsByStatus, listReviews } from "@/services/reviews";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage({
  searchParams,
}: PageProps<"/admin/reviews">) {
  const { allowed } = await requireStaffPage("content.manage", "/admin/reviews");
  if (!allowed) return <AccessDenied />;

  const raw = (await searchParams).status;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const status: ReviewStatus = (REVIEW_STATUSES as readonly string[]).includes(
    value ?? "",
  )
    ? (value as ReviewStatus)
    : "pending";
  const [rows, counts] = await Promise.all([listReviews(status), countReviewsByStatus()]);

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl text-ocean-deep">Reviews</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Reviews come only from customers whose booking is completed, through the review
        link on the booking page. Nothing appears on the website until you publish it.
      </p>

      <nav aria-label="Filter by status" className="-mx-1 mt-6 overflow-x-auto px-1">
        <ul className="flex min-w-max gap-1 border-b">
          {REVIEW_STATUSES.map((s) => (
            <li key={s}>
              <Link
                href={`/admin/reviews?status=${s}`}
                aria-current={s === status ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-ocean-deep",
                  s === status &&
                    "font-medium text-ocean-deep after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-turquoise-deep",
                )}
              >
                {REVIEW_STATUS_LABELS[s]}
                <span className="rounded-full bg-sand-soft px-2 py-0.5 text-xs text-ocean-deep tabular-nums">
                  {counts[s]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
          <p className="font-medium text-ocean-deep">
            {status === "pending" ? "No reviews waiting." : "No reviews here."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Mark a booking as completed, then send the customer the review link from the
            booking page.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map((review) => (
            <ReviewModerationCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}

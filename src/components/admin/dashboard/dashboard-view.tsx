import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CircleCheck,
  Images,
  Clock,
  Compass,
  Inbox,
  MapPin,
  Package,
  Pencil,
  Users,
  type LucideIcon,
} from "lucide-react";

import { SceneImage } from "@/components/media/scene-image";
import { can, type StaffRole } from "@/lib/auth/permissions";
import { formatMoney, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  STATUS_LABELS,
  type BookingStatus,
  type DashboardView,
} from "@/services/admin-dashboard-model";

import { BookingCalendar } from "./booking-calendar";
import { RequestsChart } from "./requests-chart";

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

function Card({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: { href: string; label: string };
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-xl border bg-card p-5", className)}
      aria-label={title}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-sans text-base font-semibold text-ocean-deep">{title}</h2>
        {action ? (
          <Link
            href={action.href}
            className="text-sm font-medium text-turquoise-deep hover:underline"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

// Every tile is a white card; the tone colours its icon chip only.
const TILE_STYLES = {
  navy: "bg-ocean-deep text-white",
  sea: "bg-turquoise-deep text-white",
  gold: "bg-gold text-ocean-deep",
  white: "bg-turquoise-soft text-turquoise-deep",
} as const;

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  hint: string;
  tone: keyof typeof TILE_STYLES;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border bg-card p-4 text-ocean-deep transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-card"
    >
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-lg",
          TILE_STYLES[tone],
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-xs font-medium text-muted-foreground">{label}</span>
        <span className="block text-3xl leading-tight font-semibold tabular-nums">
          {value.toLocaleString("en-US")}
        </span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
    </Link>
  );
}

const STATUS_BADGE: Record<BookingStatus, string> = {
  pending: "bg-[#FFF3D6] text-[#7A5200]",
  confirmed: "bg-[#E1F4EA] text-[#11633A]",
  paid: "bg-[#D5EFE0] text-[#0B4F2C]",
  completed: "bg-turquoise-soft text-ocean-deep",
  cancelled: "bg-muted text-muted-foreground",
  rejected: "bg-[#FDE8E6] text-[#9A2A1F]",
};

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_BADGE[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

/** Ranked horizontal bars in one hue; value printed at each bar's tip. */
function RankedBars({
  rows,
  unit,
}: {
  rows: { label: string; value: number }[];
  unit: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="text-ocean-deep">{row.label}</span>
            <span className="shrink-0 whitespace-nowrap text-muted-foreground tabular-nums">
              {row.value.toLocaleString("en-US")} {unit}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-sand-soft">
            <div
              className="h-2.5 rounded-full bg-turquoise-deep"
              style={{
                width: `${row.value === 0 ? 0 : Math.max(3, (row.value / max) * 100)}%`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

const dateFmt = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));

const timeAgo = (iso: string, now: Date) => {
  const minutes = Math.round((now.getTime() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
};

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export function DashboardView({
  view,
  staffName,
  role,
  now,
  editLinks = true,
}: {
  view: DashboardView;
  staffName: string;
  role: StaffRole;
  now: Date;
  editLinks?: boolean;
}) {
  const bookingsAccess = can(role, "bookings.manage");
  const contentAccess = can(role, "content.manage");
  const firstName = staffName.split(" ")[0];
  const prettyToday = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${view.today}T00:00:00Z`));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">
          Karibu, {firstName} · {prettyToday}
        </p>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* ---------------- Main column ---------------- */}
        <div className="min-w-0 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {bookingsAccess ? (
              <>
                <StatTile
                  icon={Users}
                  tone="navy"
                  label="Total bookings"
                  value={view.totals.bookings}
                  hint={`${view.totals.requestsThisMonth.toLocaleString("en-US")} received this month`}
                  href="/admin/bookings"
                />
                <StatTile
                  icon={Inbox}
                  tone="gold"
                  label="Pending bookings"
                  value={view.totals.pending}
                  hint="Waiting for confirmation"
                  href="/admin/bookings?status=pending"
                />
                <StatTile
                  icon={CalendarCheck}
                  tone="sea"
                  label="Confirmed bookings"
                  value={view.totals.confirmed}
                  hint={`Incl. paid · ${view.totals.upcomingConfirmed.toLocaleString("en-US")} still to travel`}
                  href="/admin/bookings?status=confirmed"
                />
                <StatTile
                  icon={CircleCheck}
                  tone="white"
                  label="Completed bookings"
                  value={view.totals.completed}
                  hint="Trips that have taken place"
                  href="/admin/bookings?status=completed"
                />
              </>
            ) : (
              <>
                <StatTile
                  icon={Compass}
                  tone="navy"
                  label="Published tours"
                  value={view.content.publishedTours}
                  hint="Live on the website"
                  href="/admin/tours"
                />
                <StatTile
                  icon={Pencil}
                  tone="sea"
                  label="Draft tours"
                  value={view.content.draftTours}
                  hint="Not yet published"
                  href="/admin/tours?status=draft"
                />
                <StatTile
                  icon={Package}
                  tone="gold"
                  label="Packages"
                  value={view.content.publishedPackages}
                  hint="Published"
                  href="/admin/packages"
                />
                <StatTile
                  icon={MapPin}
                  tone="white"
                  label="Destinations"
                  value={view.content.destinations}
                  hint="Published"
                  href="/admin/destinations"
                />
              </>
            )}
          </div>

          {bookingsAccess ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card
                title="Revenue from verified payments"
                action={{ href: "/admin/reports", label: "Reports" }}
              >
                {view.revenue.length === 0 ? (
                  <Empty>
                    No payments recorded yet. Record a payment on a booking once the money
                    has arrived.
                  </Empty>
                ) : (
                  <ul className="divide-y">
                    {view.revenue.map((r) => (
                      <li
                        key={r.currency}
                        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0"
                      >
                        <span>
                          <span className="block font-display text-3xl text-ocean-deep tabular-nums">
                            {formatMoney(r.total, r.currency)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            All time · {r.payments.toLocaleString("en-US")}{" "}
                            {r.payments === 1 ? "payment" : "payments"}
                          </span>
                        </span>
                        <span className="text-right">
                          <span className="block font-semibold text-ocean-deep tabular-nums">
                            {formatMoney(r.month, r.currency)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            This month
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Each currency is totalled separately; amounts are never converted.
                </p>
              </Card>

              <Card title="Most popular tours">
                {view.popularTours.length === 0 ? (
                  <Empty>Tours will be ranked here once booking requests arrive.</Empty>
                ) : (
                  <RankedBars
                    unit="requests"
                    rows={view.popularTours.map((t) => ({
                      label: t.name,
                      value: t.count,
                    }))}
                  />
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Booking requests per tour, not counting cancelled or rejected ones.
                </p>
              </Card>
            </div>
          ) : null}

          {contentAccess || bookingsAccess ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
              <Card
                title="Featured experiences"
                action={
                  contentAccess ? { href: "/admin/tours", label: "Manage" } : undefined
                }
              >
                {view.featured.length === 0 ? (
                  <Empty>
                    Nothing is featured yet. Tick “Feature on the home page” in a tour or
                    package.
                  </Empty>
                ) : (
                  <ul className="grid gap-4 sm:grid-cols-3">
                    {view.featured.map((item) => {
                      const price =
                        item.prices.find((p) => p.market === "international") ??
                        item.prices[0];
                      return (
                        <li
                          key={`${item.kind}-${item.slug}`}
                          className="overflow-hidden rounded-xl border"
                        >
                          <SceneImage
                            image={item.image}
                            showPlaceholderTag={false}
                            sizes="240px"
                            className="aspect-[4/3]"
                          />
                          <div className="p-3">
                            <p className="line-clamp-1 font-medium text-ocean-deep">
                              {item.name}
                            </p>
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {item.meta}
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-ocean-deep">
                                {price
                                  ? formatPrice(price.adult, price.currency)
                                  : "On request"}
                              </span>
                              {editLinks && contentAccess ? (
                                <Link
                                  href={`/admin/${item.kind === "tour" ? "tours" : "packages"}?q=${encodeURIComponent(item.name)}`}
                                  className="rounded-full bg-turquoise-deep px-3 py-1 text-xs font-medium text-white hover:bg-turquoise-deep/90"
                                >
                                  Edit
                                </Link>
                              ) : null}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>

              <Card title="Top destinations">
                <div className="mb-4 rounded-xl bg-turquoise-soft p-4">
                  <p className="font-display text-3xl text-ocean-deep tabular-nums">
                    {(view.topDestinations.basis === "bookings"
                      ? view.totals.bookings
                      : view.content.publishedTours
                    ).toLocaleString("en-US")}
                  </p>
                  <p className="text-xs text-ocean-deep/80">
                    {view.topDestinations.basis === "bookings"
                      ? "Booking requests in total"
                      : "Published tours"}
                  </p>
                </div>
                {view.topDestinations.rows.length === 0 ? (
                  <Empty>No destinations linked yet.</Empty>
                ) : (
                  <RankedBars
                    unit={
                      view.topDestinations.basis === "bookings" ? "requests" : "tours"
                    }
                    rows={view.topDestinations.rows.map((r) => ({
                      label: r.name,
                      value: r.count,
                    }))}
                  />
                )}
                {view.topDestinations.basis === "tours" ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Ranked by tours until booking requests arrive.
                  </p>
                ) : null}
              </Card>
            </div>
          ) : null}

          {bookingsAccess ? (
            <>
              <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
                <Card title="Requests by status">
                  {view.totals.bookings === 0 ? (
                    <Empty>No booking requests yet.</Empty>
                  ) : (
                    <>
                      <p className="mb-4">
                        <span className="font-display text-4xl text-ocean-deep tabular-nums">
                          {view.totals.bookings.toLocaleString("en-US")}
                        </span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          requests in total
                        </span>
                      </p>
                      <RankedBars
                        unit=""
                        rows={view.statusBars.map((s) => ({
                          label: s.label,
                          value: s.count,
                        }))}
                      />
                    </>
                  )}
                </Card>
                <Card title="Booking requests per month">
                  <RequestsChart data={view.monthly} />
                </Card>
              </div>

              <Card
                title="Recent booking requests"
                action={{ href: "/admin/bookings", label: "View all" }}
              >
                {view.recent.length === 0 ? (
                  <Empty>Booking requests from the website will appear here.</Empty>
                ) : (
                  <div
                    className="overflow-x-auto"
                    tabIndex={0}
                    role="region"
                    aria-label="Recent booking requests (scrolls sideways)"
                  >
                    <table className="w-full min-w-[40rem] text-sm">
                      <thead className="bg-sand-soft text-left text-xs text-muted-foreground">
                        <tr>
                          <th className="rounded-l-lg px-3 py-2 font-medium">Guest</th>
                          <th className="px-3 py-2 font-medium">Experience</th>
                          <th className="px-3 py-2 font-medium">Travel date</th>
                          <th className="px-3 py-2 font-medium">Travellers</th>
                          <th className="rounded-r-lg px-3 py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {view.recent.map((b) => (
                          <tr key={b.reference}>
                            <td className="px-3 py-2.5">
                              <p className="font-medium text-ocean-deep">
                                {b.customerName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {b.reference}
                              </p>
                            </td>
                            <td className="px-3 py-2.5 text-ocean-deep">{b.itemName}</td>
                            <td className="px-3 py-2.5 text-muted-foreground">
                              {dateFmt(b.preferredDate)}
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground tabular-nums">
                              {b.adults + b.children}
                            </td>
                            <td className="px-3 py-2.5">
                              <StatusBadge status={b.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </>
          ) : null}
        </div>

        {/* ---------------- Right rail ---------------- */}
        {bookingsAccess ? (
          <div className="grid min-w-0 content-start gap-6 md:grid-cols-2 2xl:grid-cols-1">
            <BookingCalendar today={view.today} dates={view.calendar} />

            <Card
              title="Upcoming trips"
              action={{ href: "/admin/bookings", label: "View all" }}
            >
              {view.upcoming.length === 0 ? (
                <Empty>No upcoming requested trips.</Empty>
              ) : (
                <ul className="space-y-3">
                  {view.upcoming.map((b) => (
                    <li key={b.reference} className="flex gap-3">
                      <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-turquoise-soft text-ocean-deep">
                        <span className="text-sm leading-none font-semibold">
                          {Number(b.preferredDate.slice(8))}
                        </span>
                        <span className="text-[10px] uppercase">
                          {dateFmt(b.preferredDate).split(" ")[1]}
                        </span>
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ocean-deep">
                          {b.itemName}
                        </p>
                        <p className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Users className="size-3" aria-hidden="true" />
                            {b.adults + b.children}
                          </span>
                          <StatusBadge status={b.status} />
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Recent activity">
              {view.activity.length === 0 ? (
                <Empty>Status changes by your team will appear here.</Empty>
              ) : (
                <ul className="space-y-3">
                  {view.activity.map((e, i) => (
                    <li key={`${e.reference}-${i}`} className="flex gap-3 text-sm">
                      <span
                        className="mt-1 size-2 shrink-0 rounded-full bg-turquoise-deep"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-ocean-deep">
                          <span className="font-medium">{e.changedBy ?? "Website"}</span>{" "}
                          {e.fromStatus ? "marked" : "received"} {e.reference}{" "}
                          {e.fromStatus ? (
                            <>
                              as{" "}
                              <span className="font-medium">
                                {STATUS_LABELS[e.toStatus].toLowerCase()}
                              </span>
                            </>
                          ) : (
                            "as a new request"
                          )}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" aria-hidden="true" />
                          {timeAgo(e.createdAt, now)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card
              title="Latest enquiries"
              action={{ href: "/admin/enquiries", label: "View all" }}
            >
              {view.inquiries.length === 0 ? (
                <Empty>Messages from the contact form will appear here.</Empty>
              ) : (
                <ul className="space-y-3">
                  {view.inquiries.map((q, i) => (
                    <li key={`${q.name}-${i}`} className="flex gap-3">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sand text-sm font-semibold text-ocean-deep"
                        aria-hidden="true"
                      >
                        {q.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-medium text-ocean-deep">
                          {q.name}
                          {q.status === "new" ? (
                            <span className="rounded-full bg-gold/20 px-1.5 text-[10px] font-semibold text-ocean-deep">
                              New
                            </span>
                          ) : null}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {q.subject ?? "No subject"}
                        </p>
                      </div>
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                        {timeAgo(q.createdAt, now)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        ) : (
          <Card title="Quick links" className="h-fit">
            <ul className="space-y-2 text-sm">
              {[
                { href: "/admin/tours/new", label: "Add a tour", icon: Compass },
                { href: "/admin/packages/new", label: "Add a package", icon: Package },
                { href: "/admin/media", label: "Upload photos", icon: Images },
              ].map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-ocean-deep hover:bg-sand-soft"
                  >
                    <Icon className="size-4 text-turquoise-deep" aria-hidden="true" />
                    {label}
                    <ArrowRight
                      className="ml-auto size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}

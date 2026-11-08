import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Monitor, Radio, Smartphone, Tablet, UserCheck } from "lucide-react";

import { AccessDenied } from "@/components/admin/admin-states";
import { LiveRefresh } from "@/components/admin/visitors/live-refresh";
import {
  EmptyState,
  LeadBadge,
  LiveBadge,
  StatTile,
  timeOnly,
  VisitorsHeader,
} from "@/components/admin/visitors/ui";
import { requireStaffPage } from "@/lib/auth/session";
import {
  countryFlag,
  countryName,
  formatAgo,
  formatDuration,
  liveStatus,
  renderClock,
  visitorLabel,
} from "@/lib/visitors/admin";
import { listLiveSessions } from "@/services/visitors";

export const metadata: Metadata = { title: "Live visitors" };

const DEVICE_ICONS = { mobile: Smartphone, tablet: Tablet, desktop: Monitor } as const;

export default async function LiveVisitorsPage() {
  const { allowed } = await requireStaffPage("visitors.view", "/admin/visitors/live");
  if (!allowed) return <AccessDenied />;

  const sessions = await listLiveSessions();
  const { now } = renderClock();
  const rows = sessions.map((s) => ({ ...s, status: liveStatus(s, now) }));
  // Online first, then idle, then left; most recent activity first within each.
  const order = { online: 0, idle: 1, left: 2 } as const;
  rows.sort((a, b) => order[a.status] - order[b.status]);
  const count = (status: string) => rows.filter((r) => r.status === status).length;
  const identified = rows.filter((r) => r.status !== "left" && r.visitor.email).length;

  return (
    <div className="max-w-6xl space-y-6">
      <VisitorsHeader
        title="Live visitors"
        description="People on the website in the last 30 minutes who accepted visitor statistics. Visitors who declined are only counted anonymously and don't appear here."
      >
        <LiveRefresh />
      </VisitorsHeader>

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Online now"
          value={count("online")}
          icon={Radio}
          hint="Active in the last 90 s"
        />
        <StatTile
          label="Idle"
          value={count("idle")}
          icon={Eye}
          hint="Tab in background or quiet"
        />
        <StatTile
          label="Left recently"
          value={count("left")}
          hint="In the last 30 minutes"
        />
        <StatTile
          label="Identified on site"
          value={identified}
          icon={UserCheck}
          hint="Shared an email with us"
        />
      </ul>

      {rows.length === 0 ? (
        <EmptyState title="Nobody on the website right now.">
          Visitors appear here within seconds of opening a page once they accept the
          cookie banner. Try opening the website on your phone and tapping Accept.
        </EmptyState>
      ) : (
        <div
          className="overflow-x-auto rounded-xl border bg-card"
          tabIndex={0}
          role="region"
          aria-label="Live visitors (scrolls sideways)"
        >
          <table className="w-full min-w-[64rem] text-sm">
            <thead className="border-b bg-muted/60 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Visitor</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Device</th>
                <th className="px-4 py-3 font-medium">Viewing now</th>
                <th className="px-4 py-3 font-medium">Landing page</th>
                <th className="px-4 py-3 font-medium">Arrived</th>
                <th className="px-4 py-3 text-right font-medium">Time on site</th>
                <th className="px-4 py-3 font-medium">Last activity</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((s) => {
                const v = s.visitor;
                const DeviceIcon =
                  DEVICE_ICONS[v.device as keyof typeof DEVICE_ICONS] ?? Monitor;
                const seconds =
                  (new Date(s.last_seen_at).getTime() -
                    new Date(s.started_at).getTime()) /
                  1000;
                return (
                  <tr
                    key={s.id}
                    className={s.status === "left" ? "opacity-60" : "hover:bg-muted/40"}
                  >
                    <td className="px-4 py-3">
                      <LiveBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/visitors/${v.id}`}
                        className="font-medium text-ocean-deep hover:text-turquoise-deep hover:underline"
                      >
                        {visitorLabel(v)}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-mono">V-{v.short_id}</span>
                        {v.name && v.email ? ` · ${v.email}` : ""}
                        {v.visit_count > 1
                          ? ` · visit ${v.visit_count}`
                          : " · first visit"}
                      </p>
                      {v.lead_status ? (
                        <div className="mt-1">
                          <LeadBadge status={v.lead_status} />
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span aria-hidden="true">{countryFlag(v.country)} </span>
                      {countryName(v.country)}
                      {v.city ? (
                        <p className="text-xs text-muted-foreground">
                          {[v.city, v.region].filter(Boolean).join(", ")}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 capitalize">
                        <DeviceIcon
                          className="size-3.5 text-muted-foreground"
                          aria-hidden="true"
                        />
                        {v.device}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {[v.browser, v.os].filter(Boolean).join(" · ")}
                      </p>
                    </td>
                    <td className="max-w-56 px-4 py-3">
                      <p
                        className="truncate text-ocean-deep"
                        title={s.current_title ?? undefined}
                      >
                        {s.current_title?.split(" | ")[0] ?? s.current_path}
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {s.current_path}
                      </p>
                    </td>
                    <td className="max-w-44 px-4 py-3">
                      <p className="truncate font-mono text-xs">{s.landing_path}</p>
                      {s.referrer_host ? (
                        <p className="truncate text-xs text-muted-foreground">
                          from {s.referrer_host}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{timeOnly(s.started_at)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatDuration(seconds)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatAgo(s.last_seen_at, now)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

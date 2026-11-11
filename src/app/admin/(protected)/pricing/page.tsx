import type { Metadata } from "next";
import Link from "next/link";

import { AccessDenied } from "@/components/admin/admin-states";
import { can } from "@/lib/auth/permissions";
import { requireStaffPage } from "@/lib/auth/session";
import { formatMoney, marketLabels } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  loadPricingOverview,
  MARKETS,
  type PricedItem,
} from "@/services/pricing-overview";

export const metadata: Metadata = { title: "Pricing" };

const FILTERS = {
  all: "All",
  missing: "Missing a price",
  tour: "Tours",
  package: "Packages",
} as const;
type Filter = keyof typeof FILTERS;

function matches(item: PricedItem, filter: Filter) {
  if (filter === "missing") return item.missing.length > 0;
  if (filter === "tour" || filter === "package") return item.kind === filter;
  return true;
}

export default async function PricingPage({ searchParams }: PageProps<"/admin/pricing">) {
  const { staff, allowed } = await requireStaffPage("content.manage", "/admin/pricing");
  if (!allowed) return <AccessDenied />;

  const raw = (await searchParams).show;
  const filter: Filter =
    typeof raw === "string" && raw in FILTERS ? (raw as Filter) : "all";
  const items = await loadPricingOverview();
  const rows = items.filter((i) => matches(i, filter));
  const missing = items.filter((i) => i.missing.length > 0).length;
  const canEditPrices = can(staff.role, "prices.manage");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Pricing</h1>
        <p className="max-w-3xl text-muted-foreground">
          Adult prices for every tour and package in each market. Prices are set in each
          currency separately and never converted. Open an item to change its prices
          {canEditPrices ? "" : " (only admins can change prices)"}.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="Filter"
          className="inline-flex flex-wrap rounded-lg border bg-card p-1"
        >
          {(Object.keys(FILTERS) as Filter[]).map((key) => (
            <Link
              key={key}
              href={key === "all" ? "/admin/pricing" : `/admin/pricing?show=${key}`}
              aria-current={filter === key ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium text-ocean-deep/75 hover:text-ocean-deep",
                filter === key && "bg-ocean-deep text-white hover:text-white",
              )}
            >
              {FILTERS[key]}
              {key === "missing" ? ` (${missing})` : ""}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-muted-foreground">
          {missing === 0
            ? "Every item has a price in all three markets."
            : `${missing} of ${items.length} items are missing a price in at least one market; the website shows “price on request” there.`}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          Nothing matches this filter.
        </p>
      ) : (
        <div
          className="overflow-x-auto rounded-xl border bg-card"
          tabIndex={0}
          role="region"
          aria-label="Prices (scrolls sideways)"
        >
          <table className="w-full min-w-[52rem] text-sm">
            <thead className="bg-sand-soft text-left text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Tour or package
                </th>
                {MARKETS.map((m) => (
                  <th key={m} scope="col" className="px-4 py-2.5 font-medium">
                    {marketLabels[m].long}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((item) => (
                <tr key={`${item.kind}-${item.id}`} className="align-top">
                  <th scope="row" className="px-4 py-3 text-left font-normal">
                    <Link
                      href={`/admin/${item.kind === "tour" ? "tours" : "packages"}/${item.id}`}
                      className="font-medium text-ocean-deep hover:text-turquoise-deep hover:underline"
                    >
                      {item.name}
                    </Link>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {item.kind === "tour" ? "Tour" : "Package"} ·{" "}
                      {item.status === "published" ? "Published" : "Draft"}
                      {item.illustrative ? " · example prices" : ""}
                    </span>
                  </th>
                  {MARKETS.map((m) => (
                    <td key={m} className="px-4 py-3 tabular-nums">
                      {item.adult[m].length === 0 ? (
                        <span className="inline-flex rounded-full bg-[#FFF3D6] px-2.5 py-0.5 text-xs font-medium text-[#7A5200]">
                          Not set
                        </span>
                      ) : (
                        <ul>
                          {item.adult[m].map((p) => (
                            <li key={p.currency} className="text-ocean-deep">
                              {formatMoney(p.amount, p.currency)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        “Example prices” means at least one price is still marked as illustrative sample
        data rather than a confirmed rate.
      </p>
    </div>
  );
}

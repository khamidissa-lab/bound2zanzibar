"use client";

import { useEffect, useRef, useState } from "react";

type Point = { key: string; label: string; count: number };

const HEIGHT = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 36 };
// Single series: one brand hue for the mark, text tokens for every label.
const LINE = "var(--brand-turquoise-deep)";

function niceScale(max: number) {
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000];
  const step = steps.find((s) => Math.ceil(max / s) <= 4) ?? Math.ceil(max / 4);
  const top = Math.max(step, Math.ceil(max / step) * step);
  return { top, ticks: Array.from({ length: top / step + 1 }, (_, i) => i * step) };
}

/**
 * Visitors over time: a single-series line with an area wash, crosshair and
 * tooltip on hover or keyboard focus, and a table view. The panel title
 * names the series, so there is no legend box.
 */
export function TrendChart({
  data,
  noun,
  emptyText,
}: {
  data: Point[];
  /** e.g. "visitor" (pluralised with "s"). */
  noun: string;
  emptyText: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(560);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(260, entry.contentRect.width)),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const plural = (n: number) =>
    `${n.toLocaleString("en-US")} ${noun}${n === 1 ? "" : "s"}`;
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const { top, ticks } = niceScale(Math.max(1, ...data.map((d) => d.count)));
  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH;
  const line = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.count)}`)
    .join(" ");
  const area = `${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const band = innerW / Math.max(1, data.length - 1);
  // Show at most ~7 axis labels so they never collide.
  const every = Math.max(
    1,
    Math.ceil(data.length / Math.max(2, Math.floor(innerW / 70))),
  );

  return (
    <div>
      <div ref={ref} className="relative" onPointerLeave={() => setActive(null)}>
        {total === 0 ? (
          <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed px-4 text-center text-sm text-muted-foreground">
            {emptyText}
          </div>
        ) : (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`${plural(total)} in total over ${data.length} periods`}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={width - PAD.right}
                  y1={y(t)}
                  y2={y(t)}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 8}
                  y={y(t)}
                  dy="0.32em"
                  textAnchor="end"
                  className="fill-muted-foreground text-[11px]"
                >
                  {t.toLocaleString("en-US")}
                </text>
              </g>
            ))}
            {data.map((d, i) =>
              i % every === 0 || i === data.length - 1 ? (
                <text
                  key={d.key}
                  x={x(i)}
                  y={HEIGHT - 8}
                  textAnchor={
                    i === 0 && data.length > 1
                      ? "start"
                      : i === data.length - 1 && data.length > 1
                        ? "end"
                        : "middle"
                  }
                  className="fill-muted-foreground text-[11px]"
                >
                  {d.label}
                </text>
              ) : null,
            )}
            <path d={area} fill={LINE} fillOpacity={0.1} />
            <path
              d={line}
              fill="none"
              stroke={LINE}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {active !== null ? (
              <>
                <line
                  x1={x(active)}
                  x2={x(active)}
                  y1={PAD.top}
                  y2={y(0)}
                  stroke="var(--brand-slate)"
                  strokeWidth={1}
                />
                <circle
                  cx={x(active)}
                  cy={y(data[active].count)}
                  r={5}
                  fill={LINE}
                  stroke="#fff"
                  strokeWidth={2}
                />
              </>
            ) : (
              <circle
                cx={x(data.length - 1)}
                cy={y(data.at(-1)!.count)}
                r={4}
                fill={LINE}
                stroke="#fff"
                strokeWidth={2}
              />
            )}
            {data.map((d, i) => (
              <rect
                key={d.key}
                x={x(i) - band / 2}
                y={PAD.top}
                width={band}
                height={innerH}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${d.label}: ${plural(d.count)}`}
                className="cursor-crosshair outline-none focus-visible:fill-[color:var(--brand-turquoise-soft)]"
                onPointerMove={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
            ))}
          </svg>
        )}
        {active !== null && total > 0 ? (
          <div
            role="status"
            className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border bg-card px-3 py-2 text-xs shadow-card"
            style={{
              left: Math.min(Math.max(x(active), 60), width - 60),
              top: Math.max(0, y(data[active].count) - 64),
            }}
          >
            <p className="text-base font-semibold text-ocean-deep">
              {data[active].count.toLocaleString("en-US")}
            </p>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="inline-block h-0.5 w-3 rounded-full"
                style={{ background: LINE }}
                aria-hidden="true"
              />
              {noun[0].toUpperCase() + noun.slice(1)}s · {data[active].label}
            </p>
          </div>
        ) : null}
      </div>
      <details className="mt-2 text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-ocean-deep">
          View data
        </summary>
        <table className="mt-2 w-full text-left">
          <thead className="text-muted-foreground">
            <tr>
              <th className="py-1 font-medium">Period</th>
              <th className="py-1 text-right font-medium">
                {noun[0].toUpperCase() + noun.slice(1)}s
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.key} className="border-t">
                <td className="py-1">{d.label}</td>
                <td className="py-1 text-right tabular-nums">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

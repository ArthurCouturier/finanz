import { useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { monthlyPassiveIncome, WealthPoint } from "@/services/GoalCalculationService";
import { fmtAxis, fmtMoney } from "@/utils/FormatUtils";

export interface WealthSeries {
  id: string;
  label: string;
  /** Any CSS color, typically a theme variable such as var(--chart-line-1) */
  color: string;
  points: WealthPoint[];
}

const HEIGHT = 340;
const MARGIN = { top: 28, right: 88, bottom: 40, left: 72 };
const TOOLTIP_W = 250;


/** A "nice" tick step (1, 2, 2.5, 5 × 10^k) giving about `count` ticks over `range`. */
function niceStep(range: number, count: number) {
  const safe = range > 0 ? range : 1;
  const raw = safe / count;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const normalized = raw / magnitude;
  const nice =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

/**
 * Responsive SVG line chart: capital (y, €) by year (x), one dot per year,
 * a dashed target line, a crosshair tooltip and an optional annual table.
 */
export default function WealthChart({
  series,
  target,
  startYear,
  monthlyIncomeRate,
}: {
  series: WealthSeries[];
  /** Target capital, drawn as a reference line (€) */
  target: number;
  /** Calendar year of point 0 */
  startYear: number;
  /** Yearly withdrawal rate (%): when set, the tooltip shows each curve's monthly passive income */
  monthlyIncomeRate?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const maxYear = Math.max(1, ...series.map((s) => s.points.length - 1));
  const maxAmount = Math.max(
    target,
    ...series.flatMap((s) => s.points.map((p) => p.amount))
  );
  const yStep = niceStep(maxAmount * 1.05, 5);
  const yMax = Math.max(yStep, Math.ceil((maxAmount * 1.05) / yStep) * yStep);
  const yTicks: number[] = [];
  for (let v = 0; v <= yMax + yStep / 2; v += yStep) yTicks.push(v);

  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const x = (year: number) => MARGIN.left + (year / maxYear) * plotW;
  const y = (amount: number) =>
    MARGIN.top + plotH - (Math.max(0, amount) / yMax) * plotH;

  const xEvery = maxYear <= 12 ? 1 : maxYear <= 30 ? 2 : 5;
  const xTicks: number[] = [];
  for (let yr = 0; yr <= maxYear; yr += xEvery) xTicks.push(yr);
  const lastTick = xTicks[xTicks.length - 1];
  if (lastTick !== maxYear) {
    if (maxYear - lastTick < xEvery) xTicks[xTicks.length - 1] = maxYear;
    else xTicks.push(maxYear);
  }

  const linePath = (pts: WealthPoint[]) =>
    pts
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"}${x(p.year).toFixed(1)} ${y(p.amount).toFixed(1)}`
      )
      .join(" ");
  const areaPath = (pts: WealthPoint[]) =>
    pts.length === 0
      ? ""
      : `${linePath(pts)} L${x(pts[pts.length - 1].year).toFixed(1)} ${y(0).toFixed(1)} L${x(pts[0].year).toFixed(1)} ${y(0).toFixed(1)} Z`;

  // End-of-line labels, nudged apart when two endpoints would overlap.
  const endLabels = series.map((s) => {
    const last = s.points[s.points.length - 1];
    return {
      id: s.id,
      yPos: last ? y(last.amount) : y(0),
      text: last ? fmtAxis(last.amount) : "",
    };
  });
  const sortedLabels = [...endLabels].sort((a, b) => a.yPos - b.yPos);
  for (let i = 1; i < sortedLabels.length; i++) {
    const minGap = 14;
    if (sortedLabels[i].yPos - sortedLabels[i - 1].yPos < minGap) {
      sortedLabels[i].yPos = sortedLabels[i - 1].yPos + minGap;
    }
  }

  const onMove = (e: ReactPointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    setHover(Math.min(maxYear, Math.max(0, Math.round(ratio * maxYear))));
  };

  const hoverX = hover !== null ? x(hover) : 0;
  const tooltipOnLeft = hoverX + 16 + TOOLTIP_W > width;
  const tooltipX = tooltipOnLeft ? hoverX - 16 - TOOLTIP_W : hoverX + 16;
  const rowH = monthlyIncomeRate !== undefined ? 34 : 20;
  const tooltipH = 30 + series.length * rowH;

  return (
    <div ref={containerRef} className="w-full">
      {series.length >= 2 && (
        <div className="mb-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm">
          {series.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-2">
              <span
                className="inline-block h-0.5 w-5 rounded-full"
                style={{ background: s.color }}
              />
              {s.label}
            </span>
          ))}
        </div>
      )}

      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label="Évolution du capital par année"
        className="block select-none overflow-visible"
      >
        {/* Horizontal grid + y-axis ticks */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={MARGIN.left}
              x2={MARGIN.left + plotW}
              y1={y(v)}
              y2={y(v)}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text
              x={MARGIN.left - 8}
              y={y(v) + 4}
              textAnchor="end"
              fontSize={11}
              fill="currentColor"
              className="text-muted-foreground"
            >
              {fmtAxis(v)}
            </text>
          </g>
        ))}

        {/* x-axis ticks (calendar years) */}
        {xTicks.map((yr) => (
          <text
            key={yr}
            x={x(yr)}
            y={MARGIN.top + plotH + 20}
            textAnchor="middle"
            fontSize={11}
            fill="currentColor"
            className="text-muted-foreground"
          >
            {startYear + yr}
          </text>
        ))}

        {/* Target reference line */}
        <line
          x1={MARGIN.left}
          x2={MARGIN.left + plotW}
          y1={y(target)}
          y2={y(target)}
          stroke="var(--muted-foreground)"
          strokeWidth={1}
          strokeDasharray="6 4"
        />
        <text
          x={MARGIN.left + 6}
          y={y(target) - 6}
          fontSize={11}
          fill="currentColor"
          className="text-muted-foreground"
        >
          Cible · {fmtAxis(target)}
        </text>

        {/* Series: wash under the first one, 2px lines, ringed yearly dots */}
        {series.map((s, idx) => (
          <g key={s.id}>
            {idx === 0 && (
              <path d={areaPath(s.points)} fill={s.color} opacity={0.1} />
            )}
            <path
              d={linePath(s.points)}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {s.points.map((p) => (
              <circle
                key={p.year}
                cx={x(p.year)}
                cy={y(p.amount)}
                r={hover === p.year ? 5.5 : 4}
                fill={s.color}
                stroke="var(--card)"
                strokeWidth={2}
              />
            ))}
          </g>
        ))}

        {/* End labels */}
        {endLabels.map((l) => (
          <text
            key={l.id}
            x={MARGIN.left + plotW + 10}
            y={l.yPos + 4}
            fontSize={12}
            fontWeight={600}
            fill="currentColor"
          >
            {l.text}
          </text>
        ))}

        {/* Crosshair + tooltip */}
        {hover !== null && (
          <g pointerEvents="none">
            <line
              x1={hoverX}
              x2={hoverX}
              y1={MARGIN.top}
              y2={MARGIN.top + plotH}
              stroke="var(--muted-foreground)"
              strokeWidth={1}
            />
            <rect
              x={tooltipX}
              y={MARGIN.top}
              width={TOOLTIP_W}
              height={tooltipH}
              rx={8}
              fill="var(--popover)"
              stroke="var(--border)"
            />
            <text
              x={tooltipX + 12}
              y={MARGIN.top + 19}
              fontSize={11}
              fill="currentColor"
              className="text-muted-foreground"
            >
              {startYear + hover} · année {hover}
            </text>
            {series
              .map((s) => ({ s, p: s.points[hover] as WealthPoint | undefined }))
              .sort((a, b) => (b.p?.amount ?? -Infinity) - (a.p?.amount ?? -Infinity))
              .map(({ s, p }, i) => {
              const rowY = MARGIN.top + 40 + i * rowH;
              return (
                <g key={s.id}>
                  <line
                    x1={tooltipX + 12}
                    x2={tooltipX + 26}
                    y1={rowY - 4}
                    y2={rowY - 4}
                    stroke={s.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <text
                    x={tooltipX + 34}
                    y={rowY}
                    fontSize={12}
                    fontWeight={600}
                    fill="currentColor"
                  >
                    {p ? fmtMoney(p.amount) : "—"}
                  </text>
                  <text
                    x={tooltipX + TOOLTIP_W - 12}
                    y={rowY}
                    fontSize={11}
                    textAnchor="end"
                    fill="currentColor"
                    className="text-muted-foreground"
                  >
                    {s.label}
                  </text>
                  {monthlyIncomeRate !== undefined && p && (
                    <text
                      x={tooltipX + 34}
                      y={rowY + 14}
                      fontSize={11}
                      fill="currentColor"
                      className="text-muted-foreground"
                    >
                      💤 ≈ {fmtMoney(monthlyPassiveIncome(p.amount, monthlyIncomeRate))} / mois à{" "}
                      {monthlyIncomeRate.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* Hit area: the whole plot, so the crosshair snaps to the nearest year */}
        <rect
          x={MARGIN.left}
          y={MARGIN.top}
          width={plotW}
          height={plotH}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>

      <details className="mt-2 w-full text-sm">
        <summary className="cursor-pointer opacity-70">Détail annuel</summary>
        <div className="mt-2 max-h-64 overflow-auto rounded-md border">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card">
              <tr>
                <th className="px-2 py-1 text-left">Année</th>
                {series.map((s) => (
                  <th key={s.id} className="px-2 py-1 text-right">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxYear + 1 }, (_, yr) => (
                <tr key={yr} className="border-t">
                  <td className="px-2 py-1 text-left">{startYear + yr}</td>
                  {series.map((s) => (
                    <td key={s.id} className="px-2 py-1 text-right tabular-nums">
                      {s.points[yr] ? fmtMoney(s.points[yr].amount) : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

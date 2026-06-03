import { useMemo } from "react";
import {
  describeWeatherCode,
  type HourlyPoint,
} from "../lib/weather";

type Props = {
  hourly: HourlyPoint[];
  currentTime: string; // ISO string from the API ("2026-06-03T11:00")
  units: { temperature: string };
};

const HOURS_AHEAD = 24;
const WIDTH = 720;
const HEIGHT = 180;
const PAD_X = 24;
const PAD_TOP = 36; // room for the temperature labels above the line
const PAD_BOTTOM = 28; // room for the hour labels below

/**
 * Apple-style hourly temperature curve.
 *
 * Renders the next 24 hours as a smooth SVG path with a gradient fill,
 * marks the current hour with a glowing dot, and labels every 3 hours.
 */
export function HourlyForecast({ hourly, currentTime, units }: Props) {
  const slice = useMemo(() => {
    // Find the index of the hour matching (or closest before) `currentTime`.
    // Open-Meteo returns local times like "2026-06-03T11:00" — straight
    // string comparison works because they're zero-padded.
    const now = currentTime.slice(0, 13); // "YYYY-MM-DDTHH"
    let startIdx = hourly.findIndex((h) => h.time.slice(0, 13) >= now);
    if (startIdx === -1) startIdx = 0;
    return hourly.slice(startIdx, startIdx + HOURS_AHEAD);
  }, [hourly, currentTime]);

  const { path, areaPath, points, minT, maxT, ticks } = useMemo(() => {
    if (slice.length === 0) {
      return { path: "", areaPath: "", points: [], minT: 0, maxT: 0, ticks: [] };
    }

    const temps = slice.map((p) => p.temperature);
    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);
    const range = Math.max(1, maxT - minT); // avoid divide-by-zero on flat days

    const innerW = WIDTH - PAD_X * 2;
    const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM;

    const points = slice.map((p, i) => {
      const x = PAD_X + (innerW * i) / (slice.length - 1);
      // Invert y because SVG's origin is top-left.
      const y = PAD_TOP + innerH - ((p.temperature - minT) / range) * innerH;
      return { x, y, ...p, index: i };
    });

    // Smooth path: classic Catmull-Rom → Bézier conversion. For each segment
    // P_i → P_{i+1}, we compute control points from neighboring tangents.
    const smooth = 0.2; // 0 = sharp corners, 0.3+ = very rounded
    const seg = (i: number, j: number) => {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[j];
      const p3 = points[Math.min(points.length - 1, j + 1)];
      const c1x = p1.x + (p2.x - p0.x) * smooth;
      const c1y = p1.y + (p2.y - p0.y) * smooth;
      const c2x = p2.x - (p3.x - p1.x) * smooth;
      const c2y = p2.y - (p3.y - p1.y) * smooth;
      return `C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
    };

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      path += ` ${seg(i, i + 1)}`;
    }

    // Closed area for the gradient fill below the curve.
    const baselineY = HEIGHT - PAD_BOTTOM;
    const areaPath = `${path} L ${points[points.length - 1].x},${baselineY} L ${points[0].x},${baselineY} Z`;

    // Tick marks every 3 hours.
    const ticks = points.filter((_, i) => i % 3 === 0);

    return { path, areaPath, points, minT, maxT, ticks };
  }, [slice]);

  if (slice.length === 0) return null;

  return (
    <section className="rounded-3xl bg-white/10 p-6 text-white backdrop-blur-md ring-1 ring-white/20 shadow-2xl">
      <h3 className="text-lg font-semibold mb-3">Next 24 hours</h3>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="hourly-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.45" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hourly-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#fca5a5" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#hourly-fill)" />
        <path
          d={path}
          fill="none"
          stroke="url(#hourly-stroke)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Temperature labels above each tick */}
        {ticks.map((p) => (
          <text
            key={`t-${p.index}`}
            x={p.x}
            y={p.y - 10}
            textAnchor="middle"
            className="fill-white"
            style={{ fontSize: 11, fontWeight: 500 }}
          >
            {Math.round(p.temperature)}
            {units.temperature}
          </text>
        ))}

        {/* Hour labels along the baseline */}
        {ticks.map((p) => {
          const label =
            p.index === 0
              ? "Now"
              : new Date(p.time).toLocaleTimeString(undefined, {
                  hour: "numeric",
                });
          return (
            <text
              key={`h-${p.index}`}
              x={p.x}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-white/70"
              style={{ fontSize: 11 }}
            >
              {label}
            </text>
          );
        })}

        {/* "Now" marker — glowing dot at the first point */}
        <circle
          cx={points[0].x}
          cy={points[0].y}
          r={9}
          fill="white"
          opacity={0.25}
        />
        <circle cx={points[0].x} cy={points[0].y} r={4} fill="white" />
      </svg>

      {/* Tiny tooltip strip with max precip probability in this window */}
      <PrecipNote slice={slice} />

      <p className="sr-only">
        Hourly forecast from {Math.round(minT)} to {Math.round(maxT)}
        {units.temperature}
      </p>
    </section>
  );
}

function PrecipNote({ slice }: { slice: HourlyPoint[] }) {
  // Look for the soonest hour with >40% chance of rain — the "Dark Sky"
  // touch. If none in window, find the hour with the highest probability.
  const upcoming = slice.find((h) => h.precipitationProbability >= 40);
  if (upcoming) {
    const hoursAway = slice.indexOf(upcoming);
    const desc = describeWeatherCode(upcoming.weatherCode).label.toLowerCase();
    return (
      <p className="mt-3 text-sm text-white/80">
        {hoursAway === 0
          ? `${desc} likely now (${upcoming.precipitationProbability}% chance)`
          : `${desc} in ~${hoursAway}h (${upcoming.precipitationProbability}% chance)`}
      </p>
    );
  }
  return <p className="mt-3 text-sm text-white/60">No precipitation expected.</p>;
}

import { describeWeatherCode, type DailyForecast } from "../lib/weather";

type Props = {
  daily: DailyForecast[];
  units: { temperature: string };
};

/**
 * Rank days by a simple "niceness" score: warmer is better, but rain
 * heavily penalizes the score. Skips today since "best day" is more
 * useful as a planning hint for the rest of the week.
 */
function findBestDayIndex(daily: DailyForecast[]): number {
  let bestIdx = -1;
  let bestScore = -Infinity;
  daily.forEach((d, i) => {
    if (i === 0) return; // ignore today
    const score = d.tempMax - d.precipitationProbabilityMax * 0.3;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  });
  return bestIdx;
}

export function Forecast({ daily, units }: Props) {
  const bestIdx = findBestDayIndex(daily);

  return (
    <section className="rounded-3xl bg-white/10 p-6 text-white backdrop-blur-md ring-1 ring-white/20 shadow-2xl">
      <h3 className="text-lg font-semibold mb-4">7-day forecast</h3>
      <ul className="divide-y divide-white/10">
        {daily.map((day, i) => {
          const { label, emoji } = describeWeatherCode(day.weatherCode, true);
          const date = new Date(day.date);
          const isBest = i === bestIdx;
          return (
            <li
              key={day.date}
              className={`grid grid-cols-[5rem_2.5rem_1fr_auto] items-center gap-4 py-3 px-2 -mx-2 rounded-xl transition ${
                isBest
                  ? "bg-amber-200/10 ring-1 ring-amber-200/40 shadow-[0_0_24px_rgba(253,230,138,0.18)]"
                  : ""
              }`}
            >
              <span className="text-white/80 text-sm">
                {i === 0
                  ? "Today"
                  : date.toLocaleDateString(undefined, { weekday: "short" })}
                {isBest && (
                  <span className="block text-[10px] uppercase tracking-wider text-amber-200/90 font-medium">
                    Best day
                  </span>
                )}
              </span>
              <span className="text-2xl text-center" title={label}>
                {emoji}
              </span>
              <span className="text-white/60 text-sm truncate">{label}</span>
              <span className="tabular-nums text-sm">
                <span className="text-white/60">{Math.round(day.tempMin)}°</span>
                <span className="mx-2 text-white/30">/</span>
                <span className="font-medium">
                  {Math.round(day.tempMax)}
                  {units.temperature}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

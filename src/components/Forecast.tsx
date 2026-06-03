import { describeWeatherCode, type DailyForecast } from "../lib/weather";

type Props = {
  daily: DailyForecast[];
  units: { temperature: string };
};

export function Forecast({ daily, units }: Props) {
  return (
    <section className="rounded-3xl bg-white/10 p-6 text-white backdrop-blur-md ring-1 ring-white/20 shadow-2xl">
      <h3 className="text-lg font-semibold mb-4">7-day forecast</h3>
      <ul className="divide-y divide-white/10">
        {daily.map((day, i) => {
          const { label, emoji } = describeWeatherCode(day.weatherCode, true);
          const date = new Date(day.date);
          return (
            <li
              key={day.date}
              className="grid grid-cols-[5rem_2.5rem_1fr_auto] items-center gap-4 py-3"
            >
              <span className="text-white/80 text-sm">
                {i === 0
                  ? "Today"
                  : date.toLocaleDateString(undefined, { weekday: "short" })}
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

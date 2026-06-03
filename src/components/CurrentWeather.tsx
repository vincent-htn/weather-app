import {
  describeWeatherCode,
  type CurrentWeather as CurrentWeatherType,
  type GeoResult,
} from "../lib/weather";

type Props = {
  city: GeoResult;
  current: CurrentWeatherType;
  units: { temperature: string; windSpeed: string };
};

export function CurrentWeather({ city, current, units }: Props) {
  const { label, emoji } = describeWeatherCode(current.weatherCode, current.isDay);

  return (
    <section className="rounded-3xl bg-white/10 p-8 text-white backdrop-blur-md ring-1 ring-white/20 shadow-2xl">
      <header className="flex items-baseline justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{city.name}</h2>
          <p className="text-white/70 text-sm">
            {[city.admin1, city.country].filter(Boolean).join(", ")}
          </p>
        </div>
        <p className="text-white/60 text-sm">
          {new Date(current.time).toLocaleString(undefined, {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </header>

      <div className="mt-6 flex items-center gap-6">
        <div className="text-7xl leading-none">{emoji}</div>
        <div>
          <div className="text-6xl font-light tabular-nums">
            {Math.round(current.temperature)}
            <span className="text-3xl align-top">{units.temperature}</span>
          </div>
          <p className="text-white/80">{label}</p>
          <p className="text-white/60 text-sm">
            Feels like {Math.round(current.apparentTemperature)}
            {units.temperature}
          </p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
        <Stat label="Humidity" value={`${current.humidity}%`} />
        <Stat label="Wind" value={`${Math.round(current.windSpeed)} ${units.windSpeed}`} />
      </dl>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
      <dt className="text-white/60">{label}</dt>
      <dd className="text-white text-lg font-medium tabular-nums">{value}</dd>
    </div>
  );
}

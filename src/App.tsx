import { useEffect, useState } from "react";
import { SearchBar } from "./components/SearchBar";
import { CurrentWeather } from "./components/CurrentWeather";
import { Forecast } from "./components/Forecast";
import { getWeather, type GeoResult, type WeatherResponse } from "./lib/weather";

const DEFAULT_CITY: GeoResult = {
  id: 658225,
  name: "Helsinki",
  country: "Finland",
  admin1: "Uusimaa",
  latitude: 60.16952,
  longitude: 24.93545,
  timezone: "Europe/Helsinki",
};

function App() {
  const [city, setCity] = useState<GeoResult>(DEFAULT_CITY);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather whenever the selected city changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getWeather(city.latitude, city.longitude)
      .then((data) => {
        if (!cancelled) setWeather(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to fetch weather");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [city]);

  // Background gradient changes between day/night for a bit of polish.
  const isDay = weather?.current.isDay ?? true;
  const bgClass = isDay
    ? "bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600"
    : "bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900";

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-700`}>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16 flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Weather
          </h1>
          <p className="text-white/70 mt-1">
            Powered by Open-Meteo · No API key required
          </p>
        </header>

        <div className="flex justify-center">
          <SearchBar onSelect={setCity} />
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/20 ring-1 ring-red-300/40 text-red-50 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {loading && !weather && (
          <div className="text-white/80 text-center py-12">Loading weather…</div>
        )}

        {weather && (
          <>
            <CurrentWeather city={city} current={weather.current} units={weather.units} />
            <Forecast daily={weather.daily} units={weather.units} />
          </>
        )}

        <footer className="text-center text-white/50 text-xs mt-auto pt-6">
          Built with Vite · React · Tailwind
        </footer>
      </div>
    </div>
  );
}

export default App;

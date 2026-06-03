import { useEffect, useState } from "react";
import { SearchBar } from "./components/SearchBar";
import { CurrentWeather } from "./components/CurrentWeather";
import { Forecast } from "./components/Forecast";
import { HourlyForecast } from "./components/HourlyForecast";
import { WeatherEffects } from "./components/WeatherEffects";
import {
  classifyScene,
  getWeather,
  type GeoResult,
  type WeatherResponse,
} from "./lib/weather";

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

  // Live page title — small delight: tab shows current temp and city.
  useEffect(() => {
    if (weather) {
      document.title = `${Math.round(weather.current.temperature)}${weather.units.temperature} · ${city.name}`;
    } else {
      document.title = "Weather";
    }
  }, [weather, city]);

  const isDay = weather?.current.isDay ?? true;
  const scene = weather
    ? classifyScene(weather.current.weatherCode, isDay)
    : "clear-day";

  // Background gradient driven by scene (not just day/night) — rainy days
  // get a moodier sky, clear nights get a deep cosmic tone, etc.
  const bgClass = sceneToBackground(scene);

  return (
    <div
      className={`relative min-h-screen ${bgClass} transition-colors duration-700`}
    >
      <WeatherEffects scene={scene} />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:py-16 flex flex-col gap-8">
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Weather
          </h1>
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
            <HourlyForecast
              hourly={weather.hourly}
              currentTime={weather.current.time}
              units={weather.units}
            />
            <Forecast daily={weather.daily} units={weather.units} />
          </>
        )}
      </div>
    </div>
  );
}

function sceneToBackground(
  scene: ReturnType<typeof classifyScene>,
): string {
  switch (scene) {
    case "clear-day":
      return "bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600";
    case "clear-night":
      return "bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950";
    case "cloudy":
      return "bg-gradient-to-br from-slate-500 via-slate-600 to-slate-800";
    case "fog":
      return "bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700";
    case "drizzle":
    case "rain":
      return "bg-gradient-to-br from-slate-600 via-slate-700 to-blue-900";
    case "heavy-rain":
      return "bg-gradient-to-br from-slate-700 via-slate-900 to-blue-950";
    case "thunder":
      return "bg-gradient-to-br from-slate-800 via-indigo-950 to-black";
    case "snow":
      return "bg-gradient-to-br from-slate-300 via-slate-400 to-indigo-400";
    default:
      return "bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600";
  }
}

export default App;

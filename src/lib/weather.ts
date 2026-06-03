/**
 * Open-Meteo API client.
 *
 * Open-Meteo is a free weather API that requires no API key. We use two endpoints:
 *  1. Geocoding — turn a city name into latitude/longitude.
 *  2. Forecast — current conditions + 7-day forecast for a lat/lon.
 *
 * Docs:
 *  - https://open-meteo.com/en/docs
 *  - https://open-meteo.com/en/docs/geocoding-api
 */

export type GeoResult = {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type CurrentWeather = {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
};

export type HourlyPoint = {
  time: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
};

export type DailyForecast = {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationProbabilityMax: number;
};

export type WeatherResponse = {
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyForecast[];
  units: {
    temperature: string;
    windSpeed: string;
  };
};

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export async function searchCities(query: string): Promise<GeoResult[]> {
  if (!query.trim()) return [];
  const url = new URL(GEOCODE_URL);
  url.searchParams.set("name", query);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const data = await res.json();
  return data.results ?? [];
}

export async function getWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherResponse> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day",
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,weather_code,precipitation_probability",
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
  const data = await res.json();

  const current: CurrentWeather = {
    temperature: data.current.temperature_2m,
    apparentTemperature: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day === 1,
    time: data.current.time,
  };

  const hourly: HourlyPoint[] = data.hourly.time.map((time: string, i: number) => ({
    time,
    temperature: data.hourly.temperature_2m[i],
    weatherCode: data.hourly.weather_code[i],
    precipitationProbability: data.hourly.precipitation_probability?.[i] ?? 0,
  }));

  const daily: DailyForecast[] = data.daily.time.map((date: string, i: number) => ({
    date,
    weatherCode: data.daily.weather_code[i],
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
    precipitationProbabilityMax: data.daily.precipitation_probability_max[i] ?? 0,
  }));

  return {
    current,
    hourly,
    daily,
    units: {
      temperature: data.current_units.temperature_2m,
      windSpeed: data.current_units.wind_speed_10m,
    },
  };
}

/**
 * WMO weather interpretation codes — Open-Meteo follows the World Meteorological
 * Organization spec. Map each code to a human label and an emoji.
 * https://open-meteo.com/en/docs (search "WMO Weather interpretation codes")
 */
export function describeWeatherCode(
  code: number,
  isDay = true,
): { label: string; emoji: string } {
  const sun = isDay ? "☀️" : "🌙";
  const partlyCloudy = isDay ? "⛅️" : "☁️";

  const map: Record<number, { label: string; emoji: string }> = {
    0: { label: "Clear sky", emoji: sun },
    1: { label: "Mainly clear", emoji: sun },
    2: { label: "Partly cloudy", emoji: partlyCloudy },
    3: { label: "Overcast", emoji: "☁️" },
    45: { label: "Fog", emoji: "🌫️" },
    48: { label: "Depositing rime fog", emoji: "🌫️" },
    51: { label: "Light drizzle", emoji: "🌦️" },
    53: { label: "Moderate drizzle", emoji: "🌦️" },
    55: { label: "Dense drizzle", emoji: "🌧️" },
    56: { label: "Light freezing drizzle", emoji: "🌧️" },
    57: { label: "Dense freezing drizzle", emoji: "🌧️" },
    61: { label: "Slight rain", emoji: "🌦️" },
    63: { label: "Moderate rain", emoji: "🌧️" },
    65: { label: "Heavy rain", emoji: "🌧️" },
    66: { label: "Light freezing rain", emoji: "🌧️" },
    67: { label: "Heavy freezing rain", emoji: "🌧️" },
    71: { label: "Slight snowfall", emoji: "🌨️" },
    73: { label: "Moderate snowfall", emoji: "🌨️" },
    75: { label: "Heavy snowfall", emoji: "❄️" },
    77: { label: "Snow grains", emoji: "🌨️" },
    80: { label: "Slight rain showers", emoji: "🌦️" },
    81: { label: "Moderate rain showers", emoji: "🌧️" },
    82: { label: "Violent rain showers", emoji: "⛈️" },
    85: { label: "Slight snow showers", emoji: "🌨️" },
    86: { label: "Heavy snow showers", emoji: "❄️" },
    95: { label: "Thunderstorm", emoji: "⛈️" },
    96: { label: "Thunderstorm with slight hail", emoji: "⛈️" },
    99: { label: "Thunderstorm with heavy hail", emoji: "⛈️" },
  };

  return map[code] ?? { label: "Unknown", emoji: "❓" };
}

/**
 * Classify a WMO weather code into a broad visual "scene" — used by the
 * animated overlay to decide which particle effect to render.
 */
export type WeatherScene =
  | "clear-day"
  | "clear-night"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "heavy-rain"
  | "snow"
  | "thunder";

export function classifyScene(code: number, isDay: boolean): WeatherScene {
  if ([95, 96, 99].includes(code)) return "thunder";
  if ([45, 48].includes(code)) return "fog";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([82, 65, 67].includes(code)) return "heavy-rain";
  if ([61, 63, 80, 81, 66].includes(code)) return "rain";
  if ([51, 53, 55, 56, 57].includes(code)) return "drizzle";
  if ([2, 3].includes(code)) return "cloudy";
  return isDay ? "clear-day" : "clear-night";
}

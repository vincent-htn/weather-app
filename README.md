# Weather App

A small weather web app built with Vite + React + TypeScript + Tailwind, using the [Open-Meteo](https://open-meteo.com/) API (no API key required).

## Features

- City search with autocomplete (Open-Meteo geocoding)
- Current conditions: temperature, feels-like, humidity, wind
- 7-day forecast with WMO weather codes mapped to emoji
- Light/dark gradient background based on day/night

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default: http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

`npm run build` outputs static files to `dist/` that you can host anywhere (Netlify, Vercel, GitHub Pages, S3…).

## Project structure

```
src/
├── App.tsx              ← top-level component, owns the selected city + weather state
├── main.tsx             ← React entry point (renders <App />)
├── index.css            ← Tailwind import
├── lib/
│   └── weather.ts       ← Open-Meteo API client + WMO code → emoji mapping
└── components/
    ├── SearchBar.tsx    ← debounced city search with dropdown
    ├── CurrentWeather.tsx
    └── Forecast.tsx     ← 7-day forecast list
```

## How it works

1. `SearchBar` debounces the user's input by 250ms, then calls `searchCities()` against Open-Meteo's geocoding API.
2. When the user picks a result, `App` stores the chosen city in state.
3. A `useEffect` in `App` fires whenever the city changes and calls `getWeather(lat, lon)` to fetch current conditions + a 7-day forecast.
4. The data is passed down to `<CurrentWeather />` and `<Forecast />` for rendering.

No backend, no API key — Open-Meteo is fully open and CORS-friendly so the browser can call it directly.

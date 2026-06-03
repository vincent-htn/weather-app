import { useEffect, useRef, useState } from "react";
import { searchCities, type GeoResult } from "../lib/weather";

type Props = {
  onSelect: (city: GeoResult) => void;
};

export function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce: only call the API 250ms after the user stops typing.
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const cities = await searchCities(query);
        setResults(cities);
        setOpen(true);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  // Close the dropdown when clicking outside.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handlePick(city: GeoResult) {
    onSelect(city);
    setQuery(`${city.name}, ${city.country}`);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search a city — e.g. Helsinki, Tokyo, Paris…"
        className="w-full rounded-xl bg-white/10 px-5 py-3 text-white placeholder-white/50 backdrop-blur-md ring-1 ring-white/20 focus:outline-none focus:ring-2 focus:ring-white/60 transition"
      />
      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 text-sm">
          …
        </div>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/10">
          {results.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => handlePick(c)}
                className="w-full px-5 py-3 text-left hover:bg-slate-100 transition"
              >
                <div className="font-medium text-slate-900">{c.name}</div>
                <div className="text-sm text-slate-500">
                  {[c.admin1, c.country].filter(Boolean).join(", ")}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

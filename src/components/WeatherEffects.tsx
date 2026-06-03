import { useMemo } from "react";
import type { WeatherScene } from "../lib/weather";

type Props = {
  scene: WeatherScene;
};

/**
 * Full-screen animated overlay that reflects the current weather.
 * Pointer-events disabled so it never blocks the UI underneath.
 *
 * Each effect is a CSS particle system: we generate N small divs
 * with randomized positions / delays, and CSS keyframes (defined
 * in index.css) animate them.
 */
export function WeatherEffects({ scene }: Props) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
    >
      {scene === "rain" && <Rain count={80} speed={[0.6, 1.1]} />}
      {scene === "drizzle" && <Rain count={40} speed={[0.9, 1.5]} thin />}
      {scene === "heavy-rain" && <Rain count={140} speed={[0.4, 0.8]} />}
      {scene === "thunder" && (
        <>
          <Rain count={120} speed={[0.4, 0.8]} />
          <Lightning />
        </>
      )}
      {scene === "snow" && <Snow count={70} />}
      {scene === "fog" && <Fog />}
      {scene === "cloudy" && <Clouds count={5} />}
      {scene === "clear-day" && <Sun />}
      {scene === "clear-night" && <Stars count={80} />}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Rain
 * ──────────────────────────────────────────────────────────── */

function Rain({
  count,
  speed,
  thin = false,
}: {
  count: number;
  speed: [number, number]; // seconds, min-max
  thin?: boolean;
}) {
  // useMemo so the random positions are stable across renders — otherwise
  // every parent re-render would shuffle the rain and look glitchy.
  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: speed[0] + Math.random() * (speed[1] - speed[0]),
        height: 10 + Math.random() * 18,
      })),
    [count, speed[0], speed[1]],
  );

  return (
    <>
      {drops.map((d) => (
        <span
          key={d.id}
          className={`absolute top-0 ${thin ? "w-px" : "w-0.5"} bg-white/60 rounded-full`}
          style={{
            left: `${d.left}%`,
            height: `${d.height}px`,
            animation: `rainfall ${d.duration}s linear ${d.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
}

/* ────────────────────────────────────────────────────────────
 * Snow
 * ──────────────────────────────────────────────────────────── */

function Snow({ count }: { count: number }) {
  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 8,
        size: 3 + Math.random() * 5,
      })),
    [count],
  );

  return (
    <>
      {flakes.map((f) => (
        <span
          key={f.id}
          className="absolute top-0 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.6)]"
          style={{
            left: `${f.left}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            animation: `snowfall ${f.duration}s linear ${f.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
}

/* ────────────────────────────────────────────────────────────
 * Sun (clear day)
 * ──────────────────────────────────────────────────────────── */

function Sun() {
  return (
    <div className="absolute -top-32 -right-32 w-[480px] h-[480px]">
      {/* Soft pulsing glow */}
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,236,170,0.7) 0%, rgba(255,200,100,0.0) 60%)",
          animation: "sunpulse 6s ease-in-out infinite",
        }}
      />
      {/* Slowly rotating rays */}
      <div
        className="absolute inset-0"
        style={{ animation: "sunspin 80s linear infinite" }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 h-[200px] w-1 -translate-x-1/2 origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
              background:
                "linear-gradient(to top, rgba(255,236,170,0) 0%, rgba(255,236,170,0.35) 100%)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Stars (clear night)
 * ──────────────────────────────────────────────────────────── */

function Stars({ count }: { count: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 70, // keep stars in the upper sky area
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 3,
        size: 1 + Math.random() * 2,
      })),
    [count],
  );

  return (
    <>
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
}

/* ────────────────────────────────────────────────────────────
 * Clouds (overcast / partly cloudy)
 * ──────────────────────────────────────────────────────────── */

function Clouds({ count }: { count: number }) {
  const clouds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: 5 + Math.random() * 40,
        delay: Math.random() * 60,
        duration: 80 + Math.random() * 80,
        scale: 0.6 + Math.random() * 0.8,
      })),
    [count],
  );

  return (
    <>
      {clouds.map((c) => (
        <div
          key={c.id}
          className="absolute"
          style={{
            top: `${c.top}%`,
            transform: `scale(${c.scale})`,
            animation: `drift ${c.duration}s linear ${c.delay}s infinite`,
          }}
        >
          <div className="relative w-[200px] h-[60px]">
            <span className="absolute left-0 top-3 w-24 h-12 rounded-full bg-white/30 blur-md" />
            <span className="absolute left-12 top-0 w-28 h-14 rounded-full bg-white/35 blur-md" />
            <span className="absolute left-28 top-4 w-24 h-12 rounded-full bg-white/30 blur-md" />
          </div>
        </div>
      ))}
    </>
  );
}

/* ────────────────────────────────────────────────────────────
 * Lightning (thunder)
 * ──────────────────────────────────────────────────────────── */

function Lightning() {
  return (
    <div
      className="absolute inset-0 bg-white"
      style={{ animation: "flash 8s linear infinite" }}
    />
  );
}

/* ────────────────────────────────────────────────────────────
 * Fog
 * ──────────────────────────────────────────────────────────── */

function Fog() {
  return (
    <>
      {[15, 35, 55, 75].map((top, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 h-24 bg-white/20 blur-2xl"
          style={{
            top: `${top}%`,
            animation: `mist ${20 + i * 6}s ease-in-out ${i * 2}s infinite`,
          }}
        />
      ))}
    </>
  );
}

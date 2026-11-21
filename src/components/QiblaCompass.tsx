import { Compass, LocateFixed } from "lucide-react";
import { useCompassHeading } from "@/hooks/useCompassHeading";
import { bearingToCompass, calcQibla, normalizeBearing } from "@/lib/qibla";

interface QiblaCompassProps {
  coords: { lat: number; lon: number } | null;
  cityName?: string;
}

const center = 120;
const marks = Array.from({ length: 24 }, (_, i) => i * 15);

function CompassDial({
  bearing,
  heading,
}: {
  bearing: number;
  heading: number | null;
}) {
  const north = -(heading ?? 0);
  const arrow = normalizeBearing(bearing + north);

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 240"
      className="mx-auto my-5 aspect-square w-full max-w-56"
    >
      <circle
        cx={center}
        cy={center}
        r="118"
        className="fill-secondary/40 stroke-border"
      />
      <circle
        cx={center}
        cy={center}
        r="69"
        className="fill-none stroke-border"
      />
      <g
        transform={`rotate(${north} ${center} ${center})`}
        strokeLinecap="round"
      >
        {marks.map((angle) => (
          <line
            key={angle}
            x1={center}
            x2={center}
            y1="12"
            y2={angle % 90 === 0 ? 21 : 16}
            transform={`rotate(${angle} ${center} ${center})`}
            className={
              angle % 90 === 0 ? "stroke-primary" : "stroke-muted-foreground/55"
            }
          />
        ))}
      </g>
      {["N", "E", "S", "W"].map((label, index) => {
        const radians = ((index * 90 + north) * Math.PI) / 180;
        return (
          <text
            key={label}
            x={center + Math.sin(radians) * 86}
            y={center - Math.cos(radians) * 86}
            textAnchor="middle"
            dominantBaseline="central"
            className={`text-xs font-bold ${index === 0 ? "fill-primary" : "fill-muted-foreground"}`}
          >
            {label}
          </text>
        );
      })}
      <g transform={`rotate(${arrow} ${center} ${center})`} data-qibla-arrow="">
        <path d="M120 55 134 123 120 113 106 123Z" className="fill-primary" />
      </g>
      <circle cx={center} cy={center} r="4" className="fill-primary" />
      {heading !== null && (
        <path d="M114 4h12l-6 8Z" className="fill-foreground" />
      )}
    </svg>
  );
}

function LiveQibla({
  bearing,
  cityName,
}: {
  bearing: number;
  cityName?: string;
}) {
  const { heading, error, state, start, stop } = useCompassHeading();
  const waiting =
    state === "permission" || (state === "listening" && heading === null);

  return (
    <>
      <CompassDial bearing={bearing} heading={heading?.degrees ?? null} />
      <p className="font-display text-4xl tracking-tight tabular-nums">
        {bearing}°
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {bearingToCompass(bearing)} · clockwise from true north
      </p>
      {cityName && (
        <p className="mt-2 text-xs text-muted-foreground">
          Based on the center of <strong>{cityName}</strong>. For a more precise
          bearing, use your device location.
        </p>
      )}
      <div className="mx-auto mt-4 max-w-xs border-t pt-4">
        <p
          role="status"
          className="text-sm leading-relaxed text-muted-foreground"
        >
          {error ??
            (state === "permission"
              ? "Waiting for compass permission…"
              : waiting
                ? "Looking for north. Hold your phone flat and away from metal."
                : heading
                  ? heading.magnetic
                    ? "Turn until the arrow points up. This sensor uses magnetic north, so the result is approximate."
                    : "Turn until the arrow points up. Keep your phone flat."
                  : "Use the bearing above with a compass, or turn on your phone’s live compass.")}
        </p>
        <button
          type="button"
          onClick={state === "idle" ? start : stop}
          className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
        >
          <Compass aria-hidden="true" className="size-4" />
          {state === "idle" ? "Enable live compass" : "Stop live compass"}
        </button>
      </div>
    </>
  );
}

export function QiblaCompass({ coords, cityName }: QiblaCompassProps) {
  return (
    <div className="rounded-2xl border bg-card p-5 text-center sm:p-6">
      <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
        <Compass aria-hidden="true" className="size-4" />
        Qibla direction
      </h3>
      {coords ? (
        <LiveQibla
          key={`${coords.lat},${coords.lon},${cityName ?? ""}`}
          bearing={calcQibla(coords.lat, coords.lon)}
          cityName={cityName}
        />
      ) : (
        <div className="mx-auto mt-5 max-w-xs py-4">
          <p className="text-sm text-muted-foreground">
            Choose a city or use your device location to find the Qibla.
          </p>
          <a
            href="#location-control"
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-semibold text-primary hover:bg-secondary"
          >
            <LocateFixed aria-hidden="true" className="size-4" />
            Set location
          </a>
        </div>
      )}
    </div>
  );
}

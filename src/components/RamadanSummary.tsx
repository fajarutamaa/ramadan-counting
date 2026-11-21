import { Sunrise, Sunset } from "lucide-react";
import { useFastingWindow } from "@/hooks/useFastingWindow";
import type { PrayerTimesData } from "@/hooks/usePrayerTimes";
import { formatPrayerDate } from "@/lib/prayerSchedule";

export interface RamadanInfo {
  day: number;
  tomorrowIsRamadan: boolean | null;
}

function countdown(seconds: number) {
  return [
    Math.floor(seconds / 3600),
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

export function RamadanSummary({
  prayers,
  ramadan,
}: {
  prayers: PrayerTimesData;
  ramadan: RamadanInfo;
}) {
  const { suhoor, iftar, next, valid, afterIftar, complete } = useFastingWindow(
    prayers,
    ramadan.tomorrowIsRamadan,
  );

  return (
    <div className="w-full">
      {next ? (
        <>
          <p className="text-xs font-semibold text-white/80">
            {next.label}
            {next.boundary.date !== prayers.today.date &&
              ` · ${formatPrayerDate(next.boundary.date)}`}
          </p>
          <p
            role="timer"
            className="mt-1 font-display text-[clamp(2.1rem,8vw,3.25rem)] tabular-nums"
          >
            {countdown(next.seconds)}
          </p>
          {next.fromCache && (
            <p className="mt-1 text-xs text-white/75">
              From your saved schedule
            </p>
          )}
        </>
      ) : (
        <p
          role="status"
          className="max-w-sm text-sm leading-relaxed text-white/90"
        >
          {complete
            ? "Today’s iftar marks the end of fasting for this Ramadan calendar."
            : afterIftar
              ? "The next Ramadan date or sahur time is not available yet."
              : prayers.today.loading
                ? "Loading the local fasting times…"
                : !suhoor || !iftar
                  ? "Load a local prayer schedule to see the sahur and iftar countdown."
                  : !valid
                    ? "These adjusted times don’t form a fasting window. Check your prayer settings and local schedule."
                    : "The fasting countdown is unavailable."}
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {[
          { label: "Sahur ends · Fajr", boundary: suhoor, Icon: Sunrise },
          { label: "Iftar · Maghrib", boundary: iftar, Icon: Sunset },
        ].map(({ label, boundary, Icon }) => (
          <div
            key={label}
            className="min-w-0 rounded-xl border border-white/20 bg-white/10 p-2.5"
          >
            <p className="flex items-center gap-1.5 text-xs text-white/80">
              <Icon aria-hidden="true" className="size-3.5 shrink-0" />
              {label}
            </p>
            <p className="mt-0.5 font-semibold tabular-nums">
              {boundary?.time ?? "—"}
            </p>
            {boundary && boundary.date !== prayers.today.date && (
              <p className="text-xs text-white/75">
                {formatPrayerDate(boundary.date)}
              </p>
            )}
          </div>
        ))}
      </div>
      {prayers.location && (
        <p className="mt-2 text-xs text-white/75">
          {prayers.location} · {prayers.timeZone}
        </p>
      )}
    </div>
  );
}

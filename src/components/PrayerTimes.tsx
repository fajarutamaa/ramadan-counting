import { useCallback } from "react";
import { motion } from "framer-motion";
import type { PrayerTimesData } from "@/hooks/usePrayerTimes";
import { fadeInUp } from "@/lib/animations";
import { Clock, MapPin, Compass, CalendarDays } from "lucide-react";

interface PrayerTimesProps {
  hasLocation: boolean;
  prayers: PrayerTimesData;
}

export function PrayerTimes({ hasLocation, prayers }: PrayerTimesProps) {
  const { times, loading, error, nextPrayer, minutesUntilNext } = prayers;

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ block: "start" });
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Prayer Times
          </h3>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !times.length) {
    return (
      <div className="rounded-2xl border bg-card p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Clock aria-hidden="true" className="size-4 text-primary" />
          Prayer times
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {hasLocation
            ? "The prayer schedule is temporarily unavailable."
            : "Choose a city or allow device location to see your prayer schedule."}
        </p>
        {!hasLocation && (
          <a
            href="#location-control"
            className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Find your location
          </a>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border bg-card"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Today's Prayer Times
          </h3>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {times.map((prayer) => (
            <div
              key={prayer.name}
              className={`relative rounded-lg p-2.5 sm:p-3 text-center transition-colors ${
                prayer.isCurrent
                  ? "bg-primary text-primary-foreground"
                  : prayer.isNext
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-700"
                    : "bg-secondary text-secondary-foreground"
              }`}
            >
              <div className="text-[10px] sm:text-[11px] font-medium mb-0.5 sm:mb-1 opacity-80">
                {prayer.name}
              </div>
              <div className="text-sm sm:text-base font-bold tabular-nums leading-none">
                {prayer.time}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            Current
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 dark:bg-emerald-700 ring-1 ring-emerald-400" />
            Next
          </span>
        </div>
      </div>

      {/* Contextual connections */}
      {nextPrayer && (
        <div className="border-t border-border px-6 py-3 flex items-center gap-3 flex-wrap">
          {minutesUntilNext !== null && minutesUntilNext < 60 && (
            <button
              onClick={() => scrollTo("mosques")}
              className="inline-flex min-h-8 items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <MapPin className="w-3 h-3" />
              {nextPrayer.name} in {minutesUntilNext} min — Nearby mosques
            </button>
          )}
          <button
            onClick={() => scrollTo("qibla")}
            className="inline-flex min-h-8 items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <Compass className="w-3 h-3" />
            Need to pray? Open Qibla
          </button>
          <button
            onClick={() => scrollTo("calendar")}
            className="inline-flex min-h-8 items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <CalendarDays className="w-3 h-3" />
            Islamic Calendar
          </button>
        </div>
      )}
    </motion.div>
  );
}

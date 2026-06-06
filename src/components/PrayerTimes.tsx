import { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import type { Coords } from "@/hooks/useGeolocation";
import { fadeInUp } from "@/lib/animations";
import { Clock, MapPin, Compass, CalendarDays } from "lucide-react";

interface PrayerTimesProps {
  coords: Coords | null;
}

function getTimeToPrayer(timeStr: string): string | null {
  const [h, m] = timeStr.split(":").map(Number);
  const prayer = new Date();
  prayer.setHours(h, m, 0, 0);
  const now = new Date();
  const diff = prayer.getTime() - now.getTime();
  if (diff <= 0) return null;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return null;
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hours}h ${rem}m`;
}

export function PrayerTimes({ coords }: PrayerTimesProps) {
  const { times, loading, error } = usePrayerTimes(coords);

  const nextPrayer = useMemo(() => times.find((p) => p.isNext), [times]);

  const countdown = useMemo(
    () => (nextPrayer ? getTimeToPrayer(nextPrayer.time) : null),
    [nextPrayer],
  );

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-muted-foreground" />
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

  if (error || !times.length) return null;

  return (
    <motion.div
      className="bg-card border border-border rounded-xl overflow-hidden"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Today's Prayer Times
          </h3>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {times.map((prayer) => (
            <div
              key={prayer.name}
              className={`relative rounded-lg p-3 text-center transition-colors ${
                prayer.isCurrent
                  ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                  : prayer.isNext
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-700"
                    : "bg-secondary text-secondary-foreground"
              }`}
            >
              {prayer.isCurrent && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
              )}
              <div className="text-[11px] font-medium mb-1 opacity-80">
                {prayer.name}
              </div>
              <div className="text-base font-bold tabular-nums leading-none">
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
          {countdown && !countdown.includes("h") && (
            <button
              onClick={() => scrollTo("mosques")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <MapPin className="w-3 h-3" />
              {nextPrayer.name} in {countdown} — Nearby mosques
            </button>
          )}
          <button
            onClick={() => scrollTo("qibla")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline"
          >
            <Compass className="w-3 h-3" />
            Need to pray? Open Qibla
          </button>
          <button
            onClick={() => scrollTo("calendar")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline"
          >
            <CalendarDays className="w-3 h-3" />
            Islamic Calendar
          </button>
        </div>
      )}
    </motion.div>
  );
}

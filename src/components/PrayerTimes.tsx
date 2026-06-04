import { motion } from "framer-motion";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import type { Coords } from "@/hooks/useGeolocation";
import { fadeInUp } from "@/lib/animations";
import { Clock } from "lucide-react";

interface PrayerTimesProps {
  coords: Coords | null;
}

export function PrayerTimes({ coords }: PrayerTimesProps) {
  const { times, loading, error } = usePrayerTimes(coords);

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
      className="bg-card border border-border rounded-xl p-6"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
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
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import type { Coords } from "@/hooks/useGeolocation";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Clock } from "lucide-react";

interface PrayerTimesProps {
  coords: Coords | null;
}

export function PrayerTimes({ coords }: PrayerTimesProps) {
  const { times, loading, error } = usePrayerTimes(coords);

  if (loading) {
    return (
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Prayer Times
          </h3>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !times.length) {
    return null;
  }

  return (
    <motion.div
      className="mt-6 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-teal-600" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Today's Prayer Times
        </h3>
      </div>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-5 gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {times.map((prayer) => (
          <motion.div
            key={prayer.name}
            variants={fadeInUp}
            className={`relative p-3 rounded-lg transition-all ${
              prayer.isCurrent
                ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg scale-105"
                : prayer.isNext
                  ? "bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-500 text-teal-700 dark:text-teal-300"
                  : "bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {prayer.isCurrent && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            )}
            <div className="text-center">
              <div className="text-xs font-medium mb-1 opacity-90">
                {prayer.name}
              </div>
              <div className="text-lg font-bold">{prayer.time}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          Current prayer
        </span>
        <span className="mx-2">•</span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
          Next prayer
        </span>
      </div>
    </motion.div>
  );
}

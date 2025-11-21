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
      <div className="mt-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl p-6 shadow-lg border border-slate-200/40 dark:border-slate-700/40">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Prayer Times
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="relative h-16 bg-gradient-to-r from-slate-200/50 via-slate-300/80 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-600/80 dark:to-slate-700/50 rounded-lg overflow-hidden"
            >
              <div className="absolute inset-0 animate-shimmer-skeleton" />
            </div>
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
      className="mt-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl p-6 shadow-lg border border-slate-200/40 dark:border-slate-700/40"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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
            className={`relative p-4 rounded-lg transition-all duration-300 ${
              prayer.isCurrent
                ? "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 dark:from-emerald-600 dark:via-emerald-700 dark:to-teal-700 text-white shadow-lg scale-105"
                : prayer.isNext
                  ? "bg-emerald-50/80 dark:bg-emerald-900/20 border-2 border-emerald-500 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300 shadow-md"
                  : "bg-slate-50/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700"
            }`}
            whileHover={{ scale: prayer.isCurrent ? 1.05 : 1.02 }}
          >
            {prayer.isCurrent && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg" />
            )}
            <div className="text-center">
              <div className="text-xs font-medium mb-1.5 opacity-90">
                {prayer.name}
              </div>
              <div className="text-lg font-bold">{prayer.time}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-4 text-center text-xs text-slate-600 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          Current prayer
        </span>
        <span className="mx-2">•</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full"></span>
          Next prayer
        </span>
      </div>
    </motion.div>
  );
}

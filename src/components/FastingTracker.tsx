import { motion } from "framer-motion";
import {
  Moon,
  Sunrise,
  Sunset,
  Flame,
  CalendarCheck,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { useFastingWindow } from "@/hooks/useFastingWindow";
import { useFastTracker, type FastStatus } from "@/hooks/useFastTracker";
import type { Coords } from "@/hooks/useGeolocation";
import { fadeInUp } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface FastingTrackerProps {
  coords: Coords | null;
  ramadanStart: Date | null;
}

export function FastingTracker({ coords, ramadanStart }: FastingTrackerProps) {
  const windowData = useFastingWindow(coords);
  const tracker = useFastTracker(ramadanStart);

  if (windowData.loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="h-5 w-32 rounded bg-muted animate-shimmer" />
        <div className="h-12 w-48 rounded bg-muted animate-shimmer" />
        <div className="h-2 rounded-full bg-muted animate-shimmer" />
      </div>
    );
  }

  if (windowData.error) return null;

  const countdown = windowData.isFastingHour
    ? windowData.iftarCountdown
    : windowData.suhoorEndCountdown;

  return (
    <motion.div
      className="space-y-4"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      {/* Live Fasting Window */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Moon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Today&apos;s Fast
          </h3>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              windowData.isFastingHour
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-muted text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                windowData.isFastingHour
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-muted-foreground",
              )}
            />
            {windowData.isFastingHour ? "Fasting" : "Not fasting"}
          </span>
        </div>

        {/* Next event countdown */}
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground mb-1">
            {windowData.nextEventLabel}
          </p>
          {countdown ? (
            <p className="text-3xl sm:text-4xl font-bold text-foreground tabular-nums">
              {String(countdown.hours).padStart(2, "0")}:
              {String(countdown.minutes).padStart(2, "0")}:
              {String(countdown.seconds).padStart(2, "0")}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Calculating...</p>
          )}
        </div>

        {/* Fasting window timeline */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sunrise className="w-3 h-3" />
              {windowData.fajrTime}
            </span>
            <span className="font-medium text-foreground">
              {windowData.fastingHoursToday}h
            </span>
            <span className="flex items-center gap-1">
              <Sunset className="w-3 h-3" />
              {windowData.maghribTime}
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${windowData.fastingProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Check-in + Streak */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Daily Check-in
          </h3>
          <span className="text-xs text-muted-foreground">
            Day {tracker.ramadanDaysElapsed}
          </span>
        </div>

        {/* Status buttons */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {(
            [
              {
                value: "fasted" as FastStatus,
                label: "Fasted",
                icon: Sparkles,
              },
              {
                value: "not-fasted" as FastStatus,
                label: "Skipped",
                icon: RotateCcw,
              },
              { value: "excused" as FastStatus, label: "Excused", icon: Moon },
            ] as const
          ).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => tracker.setTodayStatus(value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg py-3 px-2 text-xs font-medium transition-all border",
                tracker.todayStatus === value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Streak stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: Flame,
              label: "Streak",
              value: tracker.currentStreak,
              unit: "days",
            },
            {
              icon: Flame,
              label: "Best",
              value: tracker.longestStreak,
              unit: "days",
            },
            {
              icon: CalendarCheck,
              label: "Total",
              value: tracker.totalFasted,
              unit: `of ${tracker.ramadanDaysElapsed}`,
            },
          ].map(({ icon: Icon, label, value, unit }) => (
            <div key={label} className="text-center">
              <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground tabular-nums">
                {value}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {label} &middot; {unit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

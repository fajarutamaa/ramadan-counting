import { motion } from "framer-motion";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookMarked,
} from "lucide-react";
import { useJuzTracker } from "@/hooks/useJuzTracker";
import { fadeInUp } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface JuzTrackerProps {
  hijriYear: string | number;
}

export function JuzTracker({ hijriYear }: JuzTrackerProps) {
  const tracker = useJuzTracker(hijriYear);
  const [viewYear, setViewYear] = useState<string>(tracker.currentYear);

  const yearCompleted = tracker.records[viewYear]?.length ?? 0;

  // Generate 30 juz cells
  const cells = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <motion.div
      className="bg-card border border-border rounded-xl p-5 sm:p-6"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Quran Reading
        </h3>
        <span className="text-xs text-muted-foreground">
          {tracker.totalCompleted >= 30
            ? "Completed ✦"
            : `${tracker.totalCompleted}/30 juz`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(tracker.totalCompleted / 30) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Year selector */}
      {tracker.years.length > 0 && (
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={() =>
              setViewYear((prev) => {
                const idx = tracker.years.indexOf(prev);
                return tracker.years[Math.max(0, idx - 1)];
              })
            }
            disabled={tracker.years.indexOf(viewYear) <= 0}
            className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous year"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-semibold text-foreground">
            {viewYear} AH
          </span>
          <button
            onClick={() =>
              setViewYear((prev) => {
                const idx = tracker.years.indexOf(prev);
                return tracker.years[
                  Math.min(tracker.years.length - 1, idx + 1)
                ];
              })
            }
            disabled={
              tracker.years.indexOf(viewYear) >= tracker.years.length - 1
            }
            className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next year"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 30-juz grid */}
      <div className="grid grid-cols-6 gap-1.5 mb-4">
        {cells.map((juz) => {
          const isCompleted = (tracker.records[viewYear] ?? []).includes(juz);
          const isSuggested =
            juz === tracker.suggestedJuz &&
            viewYear === tracker.currentYear &&
            !isCompleted;
          const isCurrentYear = viewYear === tracker.currentYear;

          return (
            <button
              key={juz}
              onClick={() => isCurrentYear && tracker.toggleJuz(juz)}
              disabled={!isCurrentYear}
              className={cn(
                "relative aspect-square rounded-lg text-xs font-medium transition-all flex items-center justify-center",
                isCompleted
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : isSuggested
                    ? "bg-secondary text-foreground ring-1 ring-emerald-400 dark:ring-emerald-500"
                    : "bg-secondary text-muted-foreground hover:bg-muted-foreground/20",
                isCurrentYear &&
                  !isCompleted &&
                  "cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
                !isCurrentYear && "cursor-default opacity-80",
              )}
              title={`Juz ${juz}${isCompleted ? " — completed" : isSuggested ? " — suggested for today" : ""}`}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <span>{juz}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
        {[
          { icon: Check, label: "Completed", value: `${yearCompleted}/30` },
          {
            icon: Sparkles,
            label: "Best year",
            value: `${Math.max(1, ...Object.values(tracker.records).map((j) => j.length))}/30`,
          },
          {
            icon: BookMarked,
            label: "Years",
            value: String(tracker.years.length),
          },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="text-center">
            <Icon className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
            <div className="text-sm font-bold text-foreground tabular-nums">
              {value}
            </div>
            <div className="text-[11px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Completion celebration */}
      {tracker.isComplete && (
        <motion.div
          className="mt-4 text-center py-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Khatam Al-Quran! All 30 juz completed for {viewYear} AH
            <Sparkles className="w-3.5 h-3.5" />
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

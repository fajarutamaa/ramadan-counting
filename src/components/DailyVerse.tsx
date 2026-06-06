import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookText, Sparkles } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { quranVerses } from "@/lib/quranVerses";
import { cn } from "@/lib/utils";

export function DailyVerse() {
  // Default to today's verse (day of month % 30), persisted so navigation sticks
  const todayIndex = (new Date().getDate() - 1) % quranVerses.length;
  const [currentIndex, setCurrentIndex] = useLocalStorage(
    "dailyVerseIndex",
    todayIndex,
  );

  const verse = quranVerses[currentIndex];

  const goNext = () =>
    setCurrentIndex((prev) => (prev + 1) % quranVerses.length);
  const goPrev = () =>
    setCurrentIndex(
      (prev) => (prev - 1 + quranVerses.length) % quranVerses.length,
    );

  return (
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <BookText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Quran Verse
        </h3>
        <span className="text-xs text-muted-foreground">
          {currentIndex + 1} / {quranVerses.length}
        </span>
      </div>

      {/* Verse display */}
      <div className="min-h-[120px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <p className="text-sm sm:text-base text-foreground/85 leading-relaxed italic">
              &ldquo;{verse.text}&rdquo;
            </p>

            <div className="flex items-center justify-center gap-3 mt-4 text-xs">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {verse.surah}
              </span>
              <span className="text-muted-foreground/40">&bull;</span>
              <span className="text-muted-foreground">{verse.verse}</span>
              <span className="text-muted-foreground/40">&bull;</span>
              <span
                className={cn(
                  "text-[11px] px-1.5 py-0.5 rounded",
                  verse.revelation === "Meccan"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
                )}
              >
                {verse.revelation}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-border">
        <button
          onClick={goPrev}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Previous verse"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex gap-1">
          {quranVerses.slice(0, 7).map((_, idx) => {
            return (
              <button
                key={idx}
                onClick={() => {
                  // Go to the closest verse index with same modulo 7 offset
                  const base = Math.floor(currentIndex / 7) * 7;
                  const target = base + idx;
                  if (target < quranVerses.length) {
                    setCurrentIndex(target);
                  }
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === currentIndex % 7
                    ? "bg-emerald-500 dark:bg-emerald-400 w-5"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-1.5",
                )}
                aria-label={`Go to verse group ${idx + 1}`}
              />
            );
          })}
        </div>

        <button
          onClick={goNext}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Next verse"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Today marker */}
      {currentIndex !== todayIndex && (
        <div className="text-center mt-3">
          <button
            onClick={() => setCurrentIndex(todayIndex)}
            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <Sparkles className="w-3 h-3" />
            Today&apos;s verse
          </button>
        </div>
      )}
    </div>
  );
}

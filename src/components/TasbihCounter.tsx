import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Circle, RotateCcw, MousePointer2 } from "lucide-react";
import { useTasbih } from "@/hooks/useTasbih";
import { cn } from "@/lib/utils";

export function TasbihCounter() {
  const tasbih = useTasbih();
  const [feedback, setFeedback] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);

  const handleTap = useCallback(() => {
    tasbih.increment();
    setFeedback(true);
    setRippleKey((k) => k + 1);
    setTimeout(() => setFeedback(false), 120);
  }, [tasbih]);

  const handleReset = useCallback(() => {
    tasbih.resetCurrent();
  }, [tasbih]);

  const targetProgress = Math.min(
    100,
    (tasbih.currentCount / tasbih.currentDhikr.target) * 100,
  );
  const dailyProgress = Math.min(100, (tasbih.todayTotal / tasbih.goal) * 100);

  return (
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Circle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Tasbih
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{tasbih.todayTotal} today</span>
          <span className="text-muted-foreground/40">|</span>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            title="Reset current dhikr"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* Dhikr selector */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {tasbih.dhikrList.map((dhikr) => {
          const isActive = dhikr.id === tasbih.currentDhikr.id;
          return (
            <button
              key={dhikr.id}
              onClick={() => tasbih.setActiveDhikr(dhikr.id)}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {dhikr.label}
            </button>
          );
        })}
      </div>

      {/* Main counter area */}
      <div
        className="relative select-none"
        role="button"
        tabIndex={0}
        aria-label="Tap to count"
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            handleTap();
          }
        }}
      >
        {/* Tap target */}
        <button
          onClick={handleTap}
          className="w-full py-10 sm:py-14 rounded-2xl bg-secondary hover:bg-secondary/80 active:bg-secondary/60 transition-colors relative overflow-hidden cursor-pointer"
        >
          {/* Ripple effect */}
          <motion.div
            key={rippleKey}
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="absolute inset-0 bg-emerald-400/10 dark:bg-emerald-500/10 rounded-2xl" />
          </motion.div>

          {/* Count display */}
          <motion.div
            className="relative z-10"
            animate={feedback ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-5xl sm:text-6xl font-bold text-foreground tabular-nums mb-1">
              {tasbih.currentCount}
            </div>
            <div className="text-xs text-muted-foreground">
              {tasbih.currentDhikr.transliteration}
            </div>
          </motion.div>
        </button>

        {/* Tap hint */}
        <div className="flex items-center justify-center gap-1 mt-2 text-[11px] text-muted-foreground">
          <MousePointer2 className="w-3 h-3" />
          Tap or press Space to count
        </div>
      </div>

      {/* Per-dhikr progress */}
      <div className="mt-5 space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{tasbih.currentDhikr.label}</span>
          <span>
            {tasbih.currentCount} / {tasbih.currentDhikr.target}
          </span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${targetProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Daily goal progress */}
      <div className="mt-4 pt-4 border-t border-border space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Daily goal</span>
          <span>
            {tasbih.todayTotal} / {tasbih.goal}
          </span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${dailyProgress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

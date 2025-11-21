import { motion } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { fadeInUp } from "@/lib/animations";

interface ProgressBarProps {
  targetDate: Date | null;
}

export function ProgressBar({ targetDate }: ProgressBarProps) {
  const { percentage, daysRemaining } = useProgress(targetDate);

  if (!targetDate) return null;

  return (
    <motion.div
      className="w-full mb-6"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl p-5 shadow-lg border border-slate-200/40 dark:border-slate-700/40">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Progress to Ramadan
          </span>
          <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            {percentage.toFixed(1)}%
          </span>
        </div>

        <div className="relative h-3 bg-slate-200/70 dark:bg-slate-700/70 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 dark:from-emerald-600 dark:via-emerald-500 dark:to-teal-500 rounded-full shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        <div className="mt-2 text-center">
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
          </span>
        </div>
      </div>
    </motion.div>
  );
}

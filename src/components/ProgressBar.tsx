import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
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
      <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 shadow-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Progress to Ramadan
          </span>
          <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
            {percentage.toFixed(1)}%
          </span>
        </div>

        <Progress
          value={percentage}
          className="h-3 bg-slate-200 dark:bg-slate-700"
        />

        <div className="mt-2 text-center">
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
          </span>
        </div>
      </div>
    </motion.div>
  );
}

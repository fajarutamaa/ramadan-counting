import { motion } from "framer-motion";
import { useProgress } from "@/hooks/useProgress";
import { fadeInUp } from "@/lib/animations";
import { CalendarDays } from "lucide-react";

interface ProgressBarProps {
  targetDate: Date | null;
}

export function ProgressBar({ targetDate }: ProgressBarProps) {
  const { percentage, daysElapsed, daysRemaining } = useProgress(targetDate);

  if (percentage >= 100 || !targetDate) return null;

  return (
    <motion.div
      className="bg-card border border-border rounded-xl p-5"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Progress</h3>
      </div>

      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>{daysElapsed} days passed</span>
        <span className="font-medium text-foreground">
          {percentage.toFixed(1)}%
        </span>
        <span>{daysRemaining} days to go</span>
      </div>
    </motion.div>
  );
}

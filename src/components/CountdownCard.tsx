import { motion, AnimatePresence } from "framer-motion";
import { numberFlip } from "@/lib/animations";
import { useEffect, useState } from "react";

interface CountdownCardProps {
  value: number;
  label: string;
  index: number;
}

export function CountdownCard({ value, label, index }: CountdownCardProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [shouldScale, setShouldScale] = useState(false);

  useEffect(() => {
    if (value !== prevValue) {
      setShouldScale(true);
      setPrevValue(value);
      const timer = setTimeout(() => setShouldScale(false), 200);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  const formattedValue = value.toString().padStart(2, "0");

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
    >
      <div
        className={`bg-emerald-600 dark:bg-emerald-500 rounded-xl p-4 sm:p-5 mb-2 transition-transform duration-200 ${
          shouldScale ? "scale-95" : "scale-100"
        }`}
      >
        <div className="text-2xl sm:text-3xl font-bold text-white h-10 flex items-center justify-center overflow-hidden tabular-nums">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={formattedValue}
              variants={numberFlip}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute"
            >
              {formattedValue}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <span className="text-xs sm:text-sm font-medium text-muted-foreground">
        {label}
      </span>
    </motion.div>
  );
}

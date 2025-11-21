import { motion, AnimatePresence } from "framer-motion";
import { pulseAnimation, numberFlip } from "@/lib/animations";
import { useEffect, useState } from "react";

interface CountdownCardProps {
  value: number;
  label: string;
  index: number;
}

export function CountdownCard({ value, label, index }: CountdownCardProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [shouldPulse, setShouldPulse] = useState(false);

  useEffect(() => {
    if (value !== prevValue) {
      setShouldPulse(true);
      setPrevValue(value);
      const timer = setTimeout(() => setShouldPulse(false), 300);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  const formattedValue = value.toString().padStart(2, "0");

  return (
    <motion.div
      className="text-center"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay: index * 0.1, duration: 0.5 },
        },
      }}
    >
      <motion.div
        className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 dark:from-emerald-600 dark:via-emerald-700 dark:to-teal-700 rounded-2xl p-6 mb-3 shadow-md hover:shadow-lg overflow-hidden transition-shadow duration-300"
        animate={shouldPulse ? "pulse" : "initial"}
        variants={pulseAnimation}
        whileHover={{ scale: 1.02 }}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

        {/* Number with flip animation */}
        <div className="relative text-3xl md:text-4xl font-bold text-white h-12 flex items-center justify-center overflow-hidden">
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
      </motion.div>

      <motion.div
        className="inline-block px-4 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-sm font-medium shadow-sm"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
}

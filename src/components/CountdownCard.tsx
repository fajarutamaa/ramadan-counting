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
        className="relative bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 rounded-2xl p-6 mb-3 shadow-lg overflow-hidden"
        animate={shouldPulse ? "pulse" : "initial"}
        variants={pulseAnimation}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

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
        className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { islamicQuotes } from "@/lib/islamicQuotes";
import { fadeIn } from "@/lib/animations";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function IslamicQuotes() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useLocalStorage("quoteAutoRotate", true);

  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % islamicQuotes.length);
    }, 10000); // Rotate every 10 seconds

    return () => clearInterval(interval);
  }, [autoRotate]);

  const handlePrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + islamicQuotes.length) % islamicQuotes.length,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % islamicQuotes.length);
  };

  const currentQuote = islamicQuotes[currentIndex];

  return (
    <motion.div
      className="mt-6"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-xl p-6 shadow-md relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative min-h-[120px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-slate-700 dark:text-slate-200 font-medium text-base md:text-lg mb-3 italic">
                "{currentQuote.text}"
              </p>
              <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold">
                — {currentQuote.source}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            aria-label="Previous quote"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>

          <div className="flex gap-1">
            {islamicQuotes.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex % 5
                    ? "bg-teal-600 w-6"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
                aria-label={`Go to quote ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            aria-label="Next quote"
          >
            <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>

        {/* Auto-rotate toggle */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Auto-rotate: {autoRotate ? "On" : "Off"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

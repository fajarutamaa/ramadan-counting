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
      <div className="bg-gradient-to-br from-sage-50/80 via-emerald-50/60 to-teal-50/70 dark:from-slate-700/80 dark:via-slate-600/80 dark:to-slate-700/80 rounded-xl p-6 shadow-md border border-slate-200/40 dark:border-slate-700/40 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl" />

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
              <p className="text-slate-700 dark:text-slate-200 font-medium text-base md:text-lg mb-3 italic leading-relaxed">
                "{currentQuote.text}"
              </p>
              <p className="text-sm bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent font-semibold">
                — {currentQuote.source}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-200 shadow-sm hover:shadow"
            aria-label="Previous quote"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>

          <div className="flex gap-1.5">
            {islamicQuotes.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex % 5
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 w-6"
                    : "bg-slate-300 dark:bg-slate-600 w-2"
                }`}
                aria-label={`Go to quote ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-200 shadow-sm hover:shadow"
            aria-label="Next quote"
          >
            <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>

        {/* Auto-rotate toggle */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
          >
            Auto-rotate: {autoRotate ? "On" : "Off"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

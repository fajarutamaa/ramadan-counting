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
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRotate]);

  const currentQuote = islamicQuotes[currentIndex];

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="min-h-[100px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="text-center"
            >
              <p className="text-sm sm:text-base text-foreground/80 leading-relaxed italic">
                &ldquo;{currentQuote.text}&rdquo;
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-3">
                — {currentQuote.source}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-border">
          <button
            onClick={() =>
              setCurrentIndex(
                (prev) =>
                  (prev - 1 + islamicQuotes.length) % islamicQuotes.length,
              )
            }
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Previous quote"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-1">
            {islamicQuotes.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex % 5
                    ? "bg-emerald-500 dark:bg-emerald-400 w-5"
                    : "bg-muted-foreground/30 w-1.5"
                }`}
                aria-label={`Go to quote ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev + 1) % islamicQuotes.length)
            }
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Next quote"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center mt-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="text-[11px] text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Auto-rotate: {autoRotate ? "On" : "Off"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

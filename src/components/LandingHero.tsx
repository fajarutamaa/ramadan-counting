import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";

export function LandingHero() {
  const scrollToAbout = () => {
    const el = document.getElementById("features");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 pt-16 sm:pt-20">
      <div className="text-center max-w-3xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 mb-6"
        >
          <Sparkles className="w-3 h-3" />
          Your Ramadan Companion
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight"
        >
          Track Your Ramadan
          <br />
          <span className="text-emerald-600 dark:text-emerald-400">
            Journey with Purpose
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
        >
          A modern, minimalist app to track your fasting, prayers, Quran
          reading, and daily dhikr — all in one beautiful place.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 sm:mt-10 flex items-center justify-center gap-4"
        >
          <button
            onClick={scrollToAbout}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white px-6 py-3 text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-[0.97]"
          >
            Explore Features
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("countdown");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border hover:bg-secondary px-6 py-3 text-sm font-semibold text-foreground transition-all active:scale-[0.97]"
          >
            View Countdown
          </button>
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Moon } from "lucide-react";

export function LandingAbout() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 mb-5">
            <Moon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            About This Application
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Ramadan Counting is a thoughtfully crafted digital companion
            designed to help Muslims worldwide prepare for and experience the
            blessed month of Ramadan with greater intention and organization.
          </p>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            From a live countdown and daily verse inspiration to fasting
            tracking, Quran juz progress, and a digital tasbih — every feature
            is built with simplicity, beauty, and purpose in mind.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto"
        >
          {[
            { value: "7+", label: "Features" },
            { value: "100%", label: "Free" },
            { value: "Open", label: "Source" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

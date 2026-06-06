import { motion } from "framer-motion";
import { Timer, Moon, BookText, BookMarked, Circle, Sun } from "lucide-react";

const features = [
  {
    icon: Timer,
    title: "Live Countdown",
    description:
      "Real-time countdown to Ramadan with smooth flip animations and automatic year detection.",
  },
  {
    icon: Moon,
    title: "Fasting Tracker",
    description:
      "Track your daily fasts with live iftar/suhoor countdown, streaks, and check-in calendar.",
  },
  {
    icon: BookText,
    title: "Daily Verse",
    description:
      "A fresh Quran verse every day with beautiful transitions and revelation type badges.",
  },
  {
    icon: BookMarked,
    title: "Juz Tracker",
    description:
      "Track your Quran reading across 30 juz with yearly history and completion stats.",
  },
  {
    icon: Circle,
    title: "Digital Tasbih",
    description:
      "Count dhikr with haptic-like feedback, multiple dhikr types, and daily goal progress.",
  },
  {
    icon: Sun,
    title: "Weather & Location",
    description:
      "Local weather, prayer times, and reverse geocoding — all personalized to your location.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Key Features
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Everything you need for a mindful and organized Ramadan experience.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group relative bg-card border border-border rounded-xl p-5 sm:p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4 transition-colors group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/60">
                <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1.5">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

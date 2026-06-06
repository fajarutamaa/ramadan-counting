import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  Compass,
  CalendarDays,
  BookText,
  BookMarked,
  Circle,
  Moon,
  Sun,
} from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Prayer Times",
    description:
      "Accurate daily prayer schedules based on your location with automatic detection of current and next prayers.",
  },
  {
    icon: MapPin,
    title: "Nearby Mosques",
    description:
      "Find mosques near you with distance, address, and Google Maps directions — powered by OpenStreetMap.",
  },
  {
    icon: Compass,
    title: "Qibla Direction",
    description:
      "Find the precise direction of the Kaaba from anywhere in the world with an elegant compass interface.",
  },
  {
    icon: CalendarDays,
    title: "Islamic Calendar",
    description:
      "Track Hijri dates, upcoming Islamic events, and Ramadan countdown with accurate data.",
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
      "Track your Quran reading across 30 juz with yearly history, completion stats, and Khatam celebrations.",
  },
  {
    icon: Circle,
    title: "Digital Tasbih",
    description:
      "Count dhikr with haptic-like feedback, multiple dhikr types, daily goals, and progress tracking.",
  },
  {
    icon: Moon,
    title: "Ramadan Tools",
    description:
      "Fasting tracker with live iftar/suhoor countdown, streak tracking, and countdown to the blessed month.",
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
            Everything You Need
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            A complete set of Islamic tools designed for your daily spiritual
            journey.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
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

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
    <section id="features" className="border-y bg-secondary/45 py-12 sm:py-16">
      <div className="page-shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <p className="section-label">Features</p>
          <h2 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
            Made for daily practice
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex items-start gap-3 rounded-xl border bg-card p-4 sm:p-5"
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <Icon aria-hidden="true" className="size-4" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

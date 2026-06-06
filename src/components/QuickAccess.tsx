import { motion } from "framer-motion";
import { Clock, MapPin, Compass, CalendarDays, Search } from "lucide-react";

const accents = {
  emerald: {
    from: "#10b981",
    to: "#059669",
    glow: "rgba(16,185,129,0.2)",
    border: "rgba(16,185,129,0.35)",
  },
  teal: {
    from: "#14b8a6",
    to: "#0d9488",
    glow: "rgba(20,184,166,0.2)",
    border: "rgba(20,184,166,0.35)",
  },
  cyan: {
    from: "#06b6d4",
    to: "#0891b2",
    glow: "rgba(6,182,212,0.2)",
    border: "rgba(6,182,212,0.35)",
  },
  indigo: {
    from: "#6366f1",
    to: "#4f46e5",
    glow: "rgba(99,102,241,0.2)",
    border: "rgba(99,102,241,0.35)",
  },
  violet: {
    from: "#8b5cf6",
    to: "#7c3aed",
    glow: "rgba(139,92,246,0.2)",
    border: "rgba(139,92,246,0.35)",
  },
} as const;

const cards = [
  {
    icon: Clock,
    title: "Prayer Times",
    desc: "Accurate prayer schedules based on your location",
    href: "#prayer-times",
    accent: accents.emerald,
  },
  {
    icon: MapPin,
    title: "Nearby Mosques",
    desc: "Find mosques closest to you",
    href: "#mosques",
    accent: accents.teal,
  },
  {
    icon: Search,
    title: "Mosque Search",
    desc: "Search by name, city, or address",
    href: "#mosques",
    accent: accents.cyan,
  },
  {
    icon: Compass,
    title: "Qibla Direction",
    desc: "Find the direction of the Kaaba",
    href: "#qibla",
    accent: accents.indigo,
  },
  {
    icon: CalendarDays,
    title: "Islamic Calendar",
    desc: "Hijri dates and important events",
    href: "#calendar",
    accent: accents.violet,
  },
];

export function QuickAccess() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Quick Access
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your most-used tools, one tap away
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {cards.map(({ icon: Icon, title, desc, href, accent }, i) => (
            <motion.a
              key={title}
              href={href}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group relative flex flex-col items-center text-center gap-3 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1"
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 32px ${accent.glow}`;
                e.currentTarget.style.borderColor = accent.border;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.borderColor = "";
              }}
            >
              <div
                className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${accent.glow.replace("0.2", "0.05")} 0%, transparent 60%)`,
                }}
              />
              <div
                className="relative flex items-center justify-center w-12 h-12 rounded-full shrink-0 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="relative">
                <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed hidden sm:block">
                  {desc}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

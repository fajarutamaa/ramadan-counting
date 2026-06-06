import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const reasons = [
  {
    title: "Beautiful Minimalist Design",
    description:
      "Clean, uncluttered interface with a modern emerald palette that's easy on the eyes during late-night worship.",
  },
  {
    title: "Privacy-First",
    description:
      "All your data stays on your device. No accounts, no tracking, no servers — just localStorage.",
  },
  {
    title: "Works Offline-Friendly",
    description:
      "Core features like the tasbih, juz tracker, and fasting check-in work without an internet connection.",
  },
  {
    title: "Location-Aware",
    description:
      "Automatic prayer times and weather based on your location. No manual config needed.",
  },
  {
    title: "Dark Mode Included",
    description:
      "Seamless light/dark theme that respects your system preference or manual toggle.",
  },
  {
    title: "Open Source",
    description:
      "Built with transparency. Contribute, audit, or fork the code on GitHub.",
  },
];

export function LandingWhyChoose() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Why Choose This App?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Thoughtfully designed for the modern Muslim who values simplicity
            and purpose.
          </p>
        </motion.div>

        <div className="space-y-3 sm:space-y-4">
          {reasons.map(({ title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="flex items-start gap-4 p-4 sm:p-5 rounded-xl bg-card border border-border transition-all hover:shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
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

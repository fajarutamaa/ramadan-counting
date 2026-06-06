import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const reasons = [
  {
    title: "Accurate & Reliable",
    description:
      "Location-aware Islamic tools with accurate calculations powered by trusted data sources.",
  },
  {
    title: "Beautiful & Modern",
    description:
      "Clean design focused on usability and simplicity. A premium experience inspired by modern design principles.",
  },
  {
    title: "Fast & Responsive",
    description:
      "Optimized for all devices — from phones to desktops. Lightweight and snappy.",
  },
  {
    title: "Privacy First",
    description:
      "All your data stays on your device. No accounts, no tracking, no servers — just localStorage.",
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
    <section id="why-choose" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Why Choose Nur?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Thoughtfully designed for the modern Muslim who values simplicity
            and purpose.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
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

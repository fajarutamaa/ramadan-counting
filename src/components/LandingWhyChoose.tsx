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
    <section id="why-choose" className="page-shell py-12 sm:py-16">
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
            Why Choose Nur?
          </h2>
        </motion.div>

        <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="flex items-start gap-3 border-t py-4"
            >
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-primary"
              />
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

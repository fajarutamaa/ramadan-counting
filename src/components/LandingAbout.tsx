import { motion } from "framer-motion";
import { Moon } from "lucide-react";

export function LandingAbout() {
  return (
    <section id="about" className="page-shell pb-12 sm:pb-16">
      <div className="rounded-3xl border bg-card px-5 py-8 text-center sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 inline-grid size-10 place-items-center rounded-xl bg-secondary text-primary">
            <Moon aria-hidden="true" className="size-5" />
          </div>
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
            About Nur
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Nur is a thoughtfully crafted digital companion designed to help
            Muslims stay connected to their faith every day. From accurate
            prayer times and nearby mosques to Quran reading and dhikr, every
            feature is built with simplicity and purpose.
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
            { value: "8+", label: "Features" },
            { value: "100%", label: "Free" },
            { value: "Open", label: "Source" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-xl text-primary sm:text-2xl">
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

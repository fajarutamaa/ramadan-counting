import { motion } from "framer-motion";
import { Moon, Sparkles } from "lucide-react";
import { fadeIn, staggerContainer } from "@/lib/animations";

export function RamadanArrived() {
  return (
    <motion.div
      className="text-center py-8"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-center mb-6">
        <motion.div variants={fadeIn}>
          <Moon className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
        </motion.div>
      </div>

      <motion.h2
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3"
        variants={fadeIn}
      >
        Ramadan Mubarak!
      </motion.h2>

      <motion.p
        className="text-base sm:text-lg text-muted-foreground mb-6"
        variants={fadeIn}
      >
        The blessed month has arrived!
      </motion.p>

      <motion.div
        className="bg-card border border-border rounded-2xl p-6 max-w-xl mx-auto shadow-sm"
        variants={fadeIn}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-foreground">
            May this Ramadan bring you:
          </h3>
        </div>

        <ul className="text-left space-y-2 text-muted-foreground text-sm">
          <li className="flex items-start gap-2.5">
            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0">
              ✦
            </span>
            <span>Peace and blessings in abundance</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0">
              ✦
            </span>
            <span>Spiritual growth and closeness to Allah</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0">
              ✦
            </span>
            <span>Forgiveness and mercy from the Almighty</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0">
              ✦
            </span>
            <span>Joy and unity with family and community</span>
          </li>
        </ul>
      </motion.div>

      <motion.p
        className="mt-6 text-sm text-muted-foreground italic leading-relaxed max-w-lg mx-auto"
        variants={fadeIn}
      >
        &ldquo;The month of Ramadan in which was revealed the Quran, a guidance
        for the people and clear proofs of guidance and criterion.&rdquo;
        <br />
        <span className="font-bold text-foreground not-italic">
          — Quran 2:185
        </span>
      </motion.p>
    </motion.div>
  );
}

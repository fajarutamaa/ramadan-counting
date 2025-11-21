import { motion } from "framer-motion";
import { Sparkles, Moon, Star } from "lucide-react";
import { fadeIn, scaleIn, staggerContainer } from "@/lib/animations";

export function RamadanArrived() {
  return (
    <motion.div
      className="text-center py-12"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Animated icons */}
      <div className="flex justify-center gap-4 mb-6">
        <motion.div variants={scaleIn}>
          <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 animate-pulse" />
        </motion.div>
        <motion.div variants={scaleIn}>
          <Moon className="w-16 h-16 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
        </motion.div>
        <motion.div variants={scaleIn}>
          <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 animate-pulse" />
        </motion.div>
      </div>

      {/* Main message */}
      <motion.h2
        className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent mb-4"
        variants={fadeIn}
      >
        Ramadan Mubarak! 🌙
      </motion.h2>

      <motion.p
        className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-6"
        variants={fadeIn}
      >
        The blessed month of Ramadan has arrived!
      </motion.p>

      <motion.div
        className="bg-gradient-to-br from-sage-50/80 via-emerald-50/60 to-teal-50/70 dark:from-slate-700/80 dark:via-slate-600/80 dark:to-slate-700/80 rounded-xl p-6 max-w-2xl mx-auto border border-slate-200/40 dark:border-slate-700/40 shadow-md"
        variants={fadeIn}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            May this Ramadan bring you:
          </h3>
        </div>

        <ul className="text-left space-y-2 text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 mt-1">
              ✦
            </span>
            <span>Peace and blessings in abundance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 mt-1">
              ✦
            </span>
            <span>Spiritual growth and closeness to Allah</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 mt-1">
              ✦
            </span>
            <span>Forgiveness and mercy from the Almighty</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 mt-1">
              ✦
            </span>
            <span>Joy and unity with family and community</span>
          </li>
        </ul>
      </motion.div>

      <motion.p
        className="mt-6 text-slate-600 dark:text-slate-400 italic"
        variants={fadeIn}
      >
        "The month of Ramadan in which was revealed the Quran, a guidance for
        the people and clear proofs of guidance and criterion."
        <br />
        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent font-semibold">
          — Quran 2:185
        </span>
      </motion.p>
    </motion.div>
  );
}

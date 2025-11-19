import { motion } from "framer-motion";

export function IslamicPattern() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5 dark:opacity-10">
      {/* Top left pattern */}
      <motion.svg
        className="absolute -top-20 -left-20 w-64 h-64 text-teal-600"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 0.3, rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        viewBox="0 0 200 200"
        fill="currentColor"
      >
        <pattern
          id="pattern1"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="20" cy="20" r="2" />
          <circle cx="0" cy="0" r="2" />
          <circle cx="40" cy="0" r="2" />
          <circle cx="0" cy="40" r="2" />
          <circle cx="40" cy="40" r="2" />
        </pattern>
        <rect width="200" height="200" fill="url(#pattern1)" />
      </motion.svg>

      {/* Bottom right pattern */}
      <motion.svg
        className="absolute -bottom-20 -right-20 w-64 h-64 text-teal-600"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 0.3, rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        viewBox="0 0 200 200"
        fill="currentColor"
      >
        <pattern
          id="pattern2"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path d="M20 0 L40 20 L20 40 L0 20 Z" opacity="0.5" />
        </pattern>
        <rect width="200" height="200" fill="url(#pattern2)" />
      </motion.svg>

      {/* Center decorative star */}
      <motion.svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 text-teal-600"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      >
        <circle cx="100" cy="100" r="80" />
        <circle cx="100" cy="100" r="60" />
        <circle cx="100" cy="100" r="40" />
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const x1 = 100 + 40 * Math.cos(angle);
          const y1 = 100 + 40 * Math.sin(angle);
          const x2 = 100 + 80 * Math.cos(angle);
          const y2 = 100 + 80 * Math.sin(angle);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </motion.svg>
    </div>
  );
}

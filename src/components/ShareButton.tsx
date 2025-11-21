import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Check, Copy } from "lucide-react";
import { scaleIn } from "@/lib/animations";

interface ShareButtonProps {
  hijriYear: string;
}

export function ShareButton({ hijriYear }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: `Ramadan ${hijriYear} AH Countdown`,
      text: `Join me in counting down to the blessed month of Ramadan ${hijriYear} AH! 🌙`,
      url: window.location.href,
    };

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User cancelled or error occurred, fall through to copy
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }

    // Fallback to copying link
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <motion.button
      onClick={handleShare}
      className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-teal-700 dark:from-emerald-500 dark:via-emerald-600 dark:to-teal-500 dark:hover:from-emerald-600 dark:hover:via-emerald-700 dark:hover:to-teal-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Share countdown"
    >
      {/* Ripple effect on hover */}
      <motion.div
        className="absolute inset-0 bg-white/10"
        initial={{ scale: 0, opacity: 0.5 }}
        whileHover={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.6 }}
      />

      {copied ? (
        <>
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Copied!</span>
        </>
      ) : (
        <>
          {"share" in navigator ? (
            <Share2 className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">Share</span>
        </>
      )}
    </motion.button>
  );
}

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
      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md transition-colors"
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Share countdown"
    >
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

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  hijriYear: number | string;
}

export function ShareButton({ hijriYear }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareText = `🌙 Ramadan Mubarak ${hijriYear} AH! May this blessed month bring peace and prosperity. Check the countdown here: ${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ramadan ${hijriYear} AH`,
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard unavailable
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copied
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          Share
        </>
      )}
    </button>
  );
}

import { MapPin, Navigation, LocateFixed } from "lucide-react";
import type { Mosque } from "@/lib/mosqueApi";

interface MosqueCardProps {
  mosque: Mosque;
  onSelect?: (mosque: Mosque) => void;
}

export function MosqueCard({ mosque, onSelect }: MosqueCardProps) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`;

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 transition-all hover:shadow-sm hover:-translate-y-0.5 cursor-pointer"
      onClick={() => onSelect?.(mosque)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(mosque);
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 mt-0.5">
          <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground truncate">
            {mosque.name}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {mosque.address}
          </p>
          <div className="flex items-center gap-3 mt-2">
            {mosque.distance !== undefined && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <LocateFixed className="w-3 h-3" />
                {mosque.distance} km
              </span>
            )}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <Navigation className="w-3 h-3" />
              Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

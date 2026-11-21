import { ChevronRight } from "lucide-react";
import { formatMosqueDistance, type Mosque } from "@/lib/mosqueApi";
import { cn } from "@/lib/utils";

interface MosqueCardProps {
  mosque: Mosque;
  number: number;
  selected: boolean;
  onSelect: (mosque: Mosque) => void;
}

export function MosqueCard({
  mosque,
  number,
  selected,
  onSelect,
}: MosqueCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(mosque)}
      aria-pressed={selected}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:-outline-offset-2",
        selected
          ? "border-primary/45 bg-secondary"
          : "border-transparent hover:bg-secondary/55",
      )}
    >
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-primary",
          selected && "bg-primary text-primary-foreground",
        )}
      >
        {number}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold wrap-break-word">
          {mosque.name}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {mosque.kind === "mosque" ? "Mosque" : "Muslim prayer space"}
          {mosque.distance !== undefined &&
            ` · ${formatMosqueDistance(mosque.distance)}`}
        </span>
        {mosque.address && (
          <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {mosque.address}
          </span>
        )}
      </span>
      <ChevronRight
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
      />
    </button>
  );
}

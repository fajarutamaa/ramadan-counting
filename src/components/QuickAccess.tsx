import {
  ArrowUpRight,
  BookMarked,
  BookOpen,
  CalendarDays,
  Circle,
  Compass,
  MapPin,
} from "lucide-react";

const shortcuts = [
  { icon: MapPin, label: "Mosques", target: "mosques" },
  { icon: Compass, label: "Qibla", target: "qibla" },
  { icon: CalendarDays, label: "Calendar", target: "calendar" },
  { icon: BookOpen, label: "Daily verse", target: "verse" },
  { icon: BookMarked, label: "Juz tracker", target: "quran" },
  { icon: Circle, label: "Tasbih", target: "tasbih" },
];

export function QuickAccess() {
  return (
    <nav aria-label="Quick access">
      <p className="section-label mb-3">Quick access</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {shortcuts.map(({ icon: Icon, label, target }) => (
          <a
            key={target}
            href={`#${target}`}
            className="group flex min-h-14 items-center gap-2 rounded-xl border bg-card px-3 text-sm font-semibold transition-colors hover:border-primary/35 hover:bg-secondary"
          >
            <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
            <span>{label}</span>
            <ArrowUpRight
              aria-hidden="true"
              className="ml-auto size-3 shrink-0 text-muted-foreground group-hover:text-primary"
            />
          </a>
        ))}
      </div>
    </nav>
  );
}

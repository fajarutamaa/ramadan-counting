import { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  BookMarked,
  BookOpen,
  CalendarDays,
  Circle,
  Clock,
  Compass,
  Ellipsis,
  Heart,
  House,
  Info,
  MapPin,
  MoonStar,
  Sparkles,
} from "lucide-react";
import { ThemeToggleDropdown } from "@/components/ThemeToggle";
import { InstallAppButton } from "@/components/InstallAppButton";
import { cn } from "@/lib/utils";

const primary = [
  { id: "home", label: "Home", shortLabel: "Home", icon: House },
  {
    id: "prayer-times",
    label: "Prayer times",
    shortLabel: "Prayer",
    icon: Clock,
  },
  { id: "mosques", label: "Mosques", shortLabel: "Mosques", icon: MapPin },
  { id: "qibla", label: "Qibla", shortLabel: "Qibla", icon: Compass },
];

const secondary = [
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "verse", label: "Daily verse", icon: BookOpen },
  { id: "quran", label: "Juz tracker", icon: BookMarked },
  { id: "tasbih", label: "Tasbih", icon: Circle },
  { id: "features", label: "Features", icon: Sparkles },
  { id: "why-choose", label: "Why Nur?", icon: Heart },
  { id: "about", label: "About", icon: Info },
];

function MoreMenu({
  mobile = false,
  activeId,
}: {
  mobile?: boolean;
  activeId: string;
}) {
  const isActive = secondary.some(({ id }) => id === activeId);

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            mobile
              ? "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-semibold"
              : "inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold",
            isActive
              ? "bg-secondary text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <Ellipsis aria-hidden="true" className="size-4" />
          More
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          aria-label="More sections"
          side={mobile ? "top" : "bottom"}
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-70 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-44 overflow-y-auto rounded-xl border bg-card p-1.5 shadow-lg"
        >
          {secondary.map(({ id, label, icon: Icon }) => (
            <DropdownMenu.Item key={id} asChild>
              <a
                href={`#${id}`}
                aria-current={activeId === id ? "location" : undefined}
                className="flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm text-muted-foreground outline-none data-highlighted:bg-secondary data-highlighted:text-foreground aria-[current=location]:text-primary"
              >
                <Icon aria-hidden="true" className="size-4" />
                {label}
              </a>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function AppNav() {
  const [activeId, setActiveId] = useState("home");

  useEffect(() => {
    const sections = [...primary, ...secondary].flatMap(({ id }) => {
      const element = document.getElementById(id);
      return element ? [element] : [];
    });
    let frame = 0;

    function updateActive() {
      frame = 0;
      const targetId = window.location.hash.slice(1);
      const active = sections.reduce(
        (closest, section) => {
          const top = section.getBoundingClientRect().top;
          if (top > 104 || top < closest.top) return closest;
          if (top === closest.top && section.id !== targetId) return closest;
          return { id: section.id, top };
        },
        { id: "home", top: -Infinity },
      );
      setActiveId(active.id);
    }

    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(updateActive);
    }

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-60 border-b bg-background/95 backdrop-blur">
        <div className="page-shell flex h-16 items-center justify-between gap-4">
          <a
            href="#home"
            aria-label="Nur home"
            className="flex shrink-0 items-center gap-2.5 rounded-lg"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <MoonStar aria-hidden="true" className="size-4" />
            </span>
            <span className="font-display text-2xl tracking-tight">Nur</span>
          </a>
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 md:flex"
          >
            {primary.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={activeId === id ? "location" : undefined}
                className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground aria-[current=location]:bg-secondary aria-[current=location]:text-primary"
              >
                {label}
              </a>
            ))}
            <MoreMenu activeId={activeId} />
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <InstallAppButton />
            <ThemeToggleDropdown />
          </div>
        </div>
      </header>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-60 border-t bg-background/95 pb-safe backdrop-blur md:hidden"
      >
        <div className="mx-auto grid min-h-16 max-w-md grid-cols-5 items-center gap-1 px-2">
          {primary.map(({ id, shortLabel, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={activeId === id ? "location" : undefined}
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground aria-[current=location]:bg-secondary aria-[current=location]:text-primary"
            >
              <Icon aria-hidden="true" className="size-4" />
              {shortLabel}
            </a>
          ))}
          <MoreMenu mobile activeId={activeId} />
        </div>
      </nav>
    </>
  );
}

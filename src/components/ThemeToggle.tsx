import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Moon, Sun, Monitor, ChevronDown, Check } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function ThemeToggleDropdown() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "System" },
  ];

  const CurrentIcon =
    theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const CurrentLabel =
    theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
            "bg-white/50 hover:bg-white/80 dark:bg-slate-700/50 dark:hover:bg-slate-700/80",
            "text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400",
            "border border-slate-200/50 dark:border-slate-600/50 hover:border-emerald-500/50 dark:hover:border-emerald-400/50",
            "shadow-sm hover:shadow-md",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:focus-visible:ring-emerald-400/50",
            // Mobile: show only icon, Desktop: show icon + text
            "sm:px-3 px-2",
          )}
          aria-label={`Theme: ${CurrentLabel}`}
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{CurrentLabel}</span>
          <ChevronDown className="h-3 w-3 opacity-60 hidden sm:inline transition-transform duration-200" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            "min-w-[10rem] rounded-xl border backdrop-blur-md shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
            "bg-white/90 dark:bg-slate-800/90",
            "border-slate-200/60 dark:border-slate-700/60",
            "p-2",
          )}
        >
          {themes.map(({ value, icon: Icon, label }) => (
            <DropdownMenu.Item
              key={value}
              onSelect={() => setTheme(value)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200",
                "focus:bg-emerald-50/80 dark:focus:bg-emerald-900/20",
                "hover:bg-emerald-50/60 dark:hover:bg-emerald-900/15",
                theme === value
                  ? "bg-emerald-50/80 dark:bg-emerald-900/20 font-semibold text-emerald-700 dark:text-emerald-300"
                  : "text-slate-700 dark:text-slate-300",
              )}
            >
              <div className="flex items-center gap-2">
                <Icon
                  className={cn(
                    "h-4 w-4",
                    theme === value
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-500 dark:text-slate-400",
                  )}
                />
                <span>{label}</span>
              </div>
              {theme === value && (
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              )}
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Arrow className="fill-white/90 dark:fill-slate-800/90" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

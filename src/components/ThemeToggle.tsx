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
            "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-secondary text-muted-foreground hover:text-foreground",
            "sm:px-3 px-2",
          )}
          aria-label={`Theme: ${CurrentLabel}`}
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{CurrentLabel}</span>
          <ChevronDown className="h-3 w-3 opacity-40 hidden sm:inline" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            "min-w-[10rem] rounded-xl border bg-card shadow-sm p-1.5",
            "border-border text-foreground",
          )}
        >
          {themes.map(({ value, icon: Icon, label }) => (
            <DropdownMenu.Item
              key={value}
              onSelect={() => setTheme(value)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors",
                "focus:bg-secondary hover:bg-secondary",
                theme === value
                  ? "font-semibold text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground",
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "h-4 w-4",
                    theme === value
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground",
                  )}
                />
                <span>{label}</span>
              </div>
              {theme === value && (
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

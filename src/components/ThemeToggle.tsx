import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Moon, Sun, Monitor, ChevronDown } from "lucide-react";
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
            "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800/40",
            "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/20",
          )}
        >
          <CurrentIcon className="h-4 w-4" />
          <span>{CurrentLabel}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className={cn(
            "min-w-[8rem] rounded-lg border border-gray-200 bg-white p-1 shadow-md",
            "dark:border-gray-800 dark:bg-gray-900",
          )}
        >
          {themes.map(({ value, icon: Icon, label }) => (
            <DropdownMenu.Item
              key={value}
              onSelect={() => setTheme(value)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
                "focus:bg-gray-100 dark:focus:bg-gray-800",
                theme === value
                  ? "font-semibold text-gray-900 dark:text-gray-100"
                  : "text-gray-600 dark:text-gray-400",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Arrow className="fill-gray-200 dark:fill-gray-800" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

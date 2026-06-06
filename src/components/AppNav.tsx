"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  BookText,
  TrendingUp,
  BookMarked,
  Circle,
  Timer,
  Clock,
  Home,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggleDropdown } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

interface NavSection {
  id: string;
  label: string;
  icon: typeof Sun;
}

const sections: NavSection[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "weather", label: "Weather", icon: Sun },
  { id: "verse", label: "Verse", icon: BookText },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "quran", label: "Quran", icon: BookMarked },
  { id: "tasbih", label: "Tasbih", icon: Circle },
  { id: "countdown", label: "Countdown", icon: Timer },
  { id: "prayer", label: "Prayer", icon: Clock },
];

export function AppNav() {
  const [activeId, setActiveId] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = sections.map((s) => s.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -45% 0px", threshold: 0.05 },
    );

    elements.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/85 backdrop-blur-lg border-b border-border shadow-xs"
            : "bg-transparent",
        )}
      >
        <div className="flex items-center max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16">
          {/* Logo */}
          <button
            onClick={() => scrollTo("home")}
            className="flex items-center gap-2 shrink-0 mr-4"
          >
            <span className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              Ramadan
            </span>
            <span className="hidden sm:inline text-sm font-medium text-muted-foreground">
              Counting
            </span>
          </button>

          {/* Desktop nav items */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {sections.map(({ id, label, icon: Icon }) => {
              const isActive = activeId === id;
              return (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="w-3.5 h-4" />
                  <span>{label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute -bottom-0.5 left-2 right-2 h-0.5 rounded-full bg-emerald-500 dark:bg-emerald-400"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right side: Theme toggle + Mobile hamburger */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <ThemeToggleDropdown />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute top-0 right-0 bottom-0 w-72 bg-card border-l border-border shadow-xl p-5 pt-20"
            >
              <nav
                className="flex flex-col gap-1"
                aria-label="Mobile navigation"
              >
                {sections.map(({ id, label, icon: Icon }) => {
                  const isActive = activeId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => scrollTo(id)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                        isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

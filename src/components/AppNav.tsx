"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Clock,
  MapPin,
  Compass,
  CalendarDays,
  Sparkles,
  Info,
  Sun,
  BookText,
  BookMarked,
  Circle,
  Heart,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggleDropdown } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

interface NavSection {
  id: string;
  label: string;
  icon: typeof Home;
  mobileLabel?: string;
}

const desktopSections: NavSection[] = [
  { id: "home", label: "Home", icon: Home },
  {
    id: "prayer-times",
    label: "Prayer Times",
    icon: Clock,
    mobileLabel: "Prayer",
  },
  { id: "mosques", label: "Mosques", icon: MapPin },
  { id: "qibla", label: "Qibla", icon: Compass },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "features", label: "Features", icon: Sparkles },
  { id: "about", label: "About", icon: Info },
];

const allSections: NavSection[] = [
  ...desktopSections,
  { id: "why-choose", label: "Why Choose", icon: Heart },
  { id: "weather", label: "Weather", icon: Sun },
  { id: "verse", label: "Daily Verse", icon: BookText },
  { id: "quran", label: "Juz Tracker", icon: BookMarked },
  { id: "tasbih", label: "Tasbih", icon: Circle },
];

const mobilePrimary: NavSection[] = desktopSections.slice(0, 4);
const mobileRest: NavSection[] = allSections.slice(4);

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
    const ids = allSections.map((s) => s.id);
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
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 80,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

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
              Nur
            </span>
            <span className="hidden sm:inline text-sm font-medium text-muted-foreground">
              Muslim Companion
            </span>
          </button>

          {/* Desktop nav items */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {desktopSections.map(({ id, label, icon: Icon }) => {
              const isActive = activeId === id;
              return (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    "md:px-2 md:text-xs md:gap-1 lg:px-3 lg:text-sm lg:gap-1.5",
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

          {/* Right side */}
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

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-lg border-t border-border px-2 pb-safe">
        <div className="flex items-center justify-around h-14">
          {mobilePrimary.map(({ id, label, icon: Icon, mobileLabel }) => {
            const isActive = activeId === id;
            return (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all",
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-medium">
                  {mobileLabel ?? label}
                </span>
                {isActive && (
                  <span className="w-4 h-0.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                )}
              </button>
            );
          })}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all",
              mobileOpen
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Menu className="w-4 h-4" />
            <span className="text-[10px] font-medium">More</span>
            {mobileOpen && (
              <span className="w-4 h-0.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

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
                {mobileRest.map(({ id, label, icon: Icon }) => {
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

                {/* Separator */}
                <div className="my-3 border-t border-border" />

                {/* Primary items in drawer (duplicated for convenience) */}
                {mobilePrimary.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                      activeId === id
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

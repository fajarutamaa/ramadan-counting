import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Moon, Star, Loader2 } from "lucide-react";
import { fadeInUp } from "@/lib/animations";

interface IslamicCalendarProps {
  coords: { lat: number; lon: number } | null;
}

interface HijriDate {
  day: number;
  month: string;
  monthEn: string;
  year: number;
}

interface IslamicEvent {
  name: string;
  date: Date;
  type: "event" | "holiday";
  emoji: string;
}

function getIslamicEvents(year: number): IslamicEvent[] {
  return [
    {
      name: "Isra' Mi'raj",
      date: new Date(year, 0, 27),
      type: "event",
      emoji: "🌙",
    },
    {
      name: "Ramadan begins",
      date: new Date(year, 1, 28),
      type: "event",
      emoji: "🌙",
    },
    {
      name: "Nuzul Al-Qur'an",
      date: new Date(year, 3, 17),
      type: "event",
      emoji: "📖",
    },
    {
      name: "Eid al-Fitr",
      date: new Date(year, 3, 29),
      type: "holiday",
      emoji: "🎉",
    },
    {
      name: "Day of Arafah",
      date: new Date(year, 6, 8),
      type: "event",
      emoji: "🤲",
    },
    {
      name: "Eid al-Adha",
      date: new Date(year, 6, 9),
      type: "holiday",
      emoji: "🐑",
    },
    {
      name: "Islamic New Year",
      date: new Date(year, 6, 30),
      type: "event",
      emoji: "✨",
    },
    {
      name: "Day of Ashura",
      date: new Date(year, 7, 9),
      type: "event",
      emoji: "🕯️",
    },
    {
      name: "Mawlid al-Nabi",
      date: new Date(year, 8, 12),
      type: "event",
      emoji: "🕊️",
    },
  ];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function IslamicCalendar({ coords }: IslamicCalendarProps) {
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    async function fetchHijri() {
      setLoading(true);
      setError(null);
      try {
        const today = new Date();
        const adj = coords
          ? `latitude=${coords.lat}&longitude=${coords.lon}`
          : "";
        const res = await fetch(
          `${baseUrl}/gToH/${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}?${adj}`,
        );
        const json = await res.json();
        if (json.code === 200 && json.data) {
          const d = json.data.hijri;
          setHijriDate({
            day: Number(d.day),
            month: d.month.ar,
            monthEn: d.month.en,
            year: Number(d.year),
          });
        } else {
          throw new Error("Invalid API response");
        }
      } catch {
        setError("Could not load Islamic date.");
      } finally {
        setLoading(false);
      }
    }
    fetchHijri();
  }, [baseUrl, coords]);

  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();

  const events = useMemo(() => {
    const allEvents = getIslamicEvents(currentYear);
    const future = allEvents.filter((e) => e.date >= now);

    if (future.length > 0) return future;
    return getIslamicEvents(currentYear + 1);
  }, [currentYear, now]);

  const nextRamadan = useMemo<Date | null>(() => {
    const thisYear = getIslamicEvents(currentYear).find((e) =>
      e.name.toLowerCase().includes("ramadan begins"),
    );
    if (thisYear && thisYear.date >= now) return thisYear.date;

    const nextYear = getIslamicEvents(currentYear + 1).find((e) =>
      e.name.toLowerCase().includes("ramadan begins"),
    );
    return nextYear ? nextYear.date : null;
  }, [currentYear, now]);

  const ramadanCountdown = useMemo(() => {
    if (!nextRamadan) return null;
    const diff = nextRamadan.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return { days, hours };
  }, [nextRamadan, now]);

  return (
    <motion.div
      className="bg-card border border-border rounded-xl overflow-hidden"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="p-5 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
            <CalendarDays className="w-3 h-3" />
            Islamic Calendar
          </div>
        </div>

        {/* Today's Hijri */}
        {loading ? (
          <div className="flex items-center gap-3 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Loading Islamic date...
            </span>
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : hijriDate ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {hijriDate.day} {hijriDate.month} {hijriDate.year} AH
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {hijriDate.monthEn} {hijriDate.year}
              </p>
            </div>
          </div>
        ) : null}

        {/* Ramadan countdown */}
        {ramadanCountdown && (
          <div className="rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                Ramadan Countdown
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-rose-700 dark:text-rose-300">
                {ramadanCountdown.days}
              </span>
              <span className="text-sm text-rose-600/80 dark:text-rose-400/80">
                days
              </span>
              <span className="text-muted-foreground mx-1">·</span>
              <span className="text-lg font-semibold text-rose-700 dark:text-rose-300">
                {ramadanCountdown.hours}
              </span>
              <span className="text-sm text-rose-600/80 dark:text-rose-400/80">
                hours
              </span>
            </div>
            <p className="text-xs text-rose-600/60 dark:text-rose-400/60 mt-1">
              Until{" "}
              {nextRamadan?.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        )}

        {/* Upcoming events */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Upcoming Events
          </h4>
          <div className="space-y-2">
            {events.slice(0, 5).map((event, i) => (
              <motion.div
                key={`${event.name}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <span className="text-base">{event.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {event.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(event.date)}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    event.type === "holiday"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {event.type === "holiday" ? "Holiday" : "Event"}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

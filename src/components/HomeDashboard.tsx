import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  MapPin,
  Clock,
  Moon,
  Star,
  BookText,
  ExternalLink,
  Sparkles,
  Sunrise,
  Sunset,
  Sun,
  CloudMoon,
} from "lucide-react";
import { fetchNearbyMosques, type Mosque } from "@/lib/mosqueApi";
import { usePrayerTimes, type PrayerTime } from "@/hooks/usePrayerTimes";
import { quranVerses } from "@/lib/quranVerses";

const KAABA = { lat: 21.4225, lon: 39.8262 };

function calcQibla(lat: number, lon: number): number {
  const dLon = ((KAABA.lon - lon) * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lat2 = (KAABA.lat * Math.PI) / 180;
  const y = Math.sin(dLon);
  const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLon);
  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;
  return Math.round(bearing);
}

function getGreeting(): { text: string; Icon: typeof Sun } {
  const h = new Date().getHours();
  if (h < 5) return { text: "Blessed Night", Icon: Moon };
  if (h < 12) return { text: "Good Morning", Icon: Sunrise };
  if (h < 17) return { text: "Good Afternoon", Icon: Sun };
  if (h < 20) return { text: "Good Evening", Icon: Sunset };
  return { text: "Peaceful Evening", Icon: CloudMoon };
}

function getTimeToPrayer(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const prayer = new Date();
  prayer.setHours(h, m, 0, 0);
  const now = new Date();
  const diff = prayer.getTime() - now.getTime();
  if (diff <= 0) return "Now";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hours}h ${rem}m`;
}

function getTodayVerse() {
  const day = new Date().getDate();
  return quranVerses[day % quranVerses.length];
}

interface IslamicEvent {
  name: string;
  date: string;
  emoji: string;
  daysUntil: number;
}

function getNextEvent(): IslamicEvent | null {
  const now = new Date();
  const events = [
    {
      name: "Isra' Mi'raj",
      date: new Date(now.getFullYear(), 0, 27),
      emoji: "🌙",
    },
    {
      name: "Ramadan begins",
      date: new Date(now.getFullYear(), 1, 28),
      emoji: "🌙",
    },
    {
      name: "Eid al-Fitr",
      date: new Date(now.getFullYear(), 3, 29),
      emoji: "🎉",
    },
    {
      name: "Eid al-Adha",
      date: new Date(now.getFullYear(), 6, 9),
      emoji: "🐑",
    },
    {
      name: "Islamic New Year",
      date: new Date(now.getFullYear(), 6, 30),
      emoji: "✨",
    },
    {
      name: "Mawlid al-Nabi",
      date: new Date(now.getFullYear(), 8, 12),
      emoji: "🕊️",
    },
  ];

  for (const e of events) {
    if (e.date >= now) {
      const d = Math.ceil((e.date.getTime() - now.getTime()) / 86400000);
      return {
        ...e,
        date: e.date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
        }),
        daysUntil: d,
      };
    }
  }
  return null;
}

interface HomeDashboardProps {
  coords: { lat: number; lon: number } | null;
  location: string;
}

export function HomeDashboard({ coords, location }: HomeDashboardProps) {
  const { times: prayerTimes } = usePrayerTimes(coords);
  const [nearbySummary, setNearbySummary] = useState<{
    count: number;
    closest: Mosque | null;
  } | null>(null);
  const [hijriDate, setHijriDate] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Hijri date
  useEffect(() => {
    if (!coords) return;
    const cached = sessionStorage.getItem("hijriDate");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.date === new Date().toDateString()) {
          setHijriDate(parsed.display);
          return;
        }
      } catch {
        // ignore cache parse error
      }
    }
    async function fetchHijri() {
      try {
        const today = new Date();
        if (!coords) return;
        const res = await fetch(
          `${baseUrl}/gToH/${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}?latitude=${coords.lat}&longitude=${coords.lon}`,
        );
        const json = await res.json();
        if (json.code === 200 && json.data) {
          const d = json.data.hijri;
          const display = `${d.day} ${d.month.en} ${d.year} AH`;
          setHijriDate(display);
          sessionStorage.setItem(
            "hijriDate",
            JSON.stringify({ date: new Date().toDateString(), display }),
          );
        }
      } catch {
        // ignore fetch error, dashboard still works
      }
    }
    fetchHijri();
  }, [coords, baseUrl]);

  // Nearby mosque summary
  useEffect(() => {
    if (!coords) return;
    fetchNearbyMosques(coords.lat, coords.lon, 3000)
      .then((results) => {
        setNearbySummary({
          count: results.length,
          closest: results[0] ?? null,
        });
      })
      .catch(() => {});
  }, [coords]);

  const greeting = useMemo(getGreeting, []);
  const { text: greetingText, Icon: GreetingIcon } = greeting;

  const currentPrayer = useMemo(
    () => prayerTimes.find((p) => p.isCurrent),
    [prayerTimes],
  );
  const nextPrayer = useMemo(
    () => prayerTimes.find((p) => p.isNext),
    [prayerTimes],
  );

  const nextPrayerCountdown = useMemo(
    () => (nextPrayer ? getTimeToPrayer(nextPrayer.time) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nextPrayer, now],
  );

  const qibla = useMemo(
    () => (coords ? calcQibla(coords.lat, coords.lon) : null),
    [coords],
  );

  const todayVerse = useMemo(getTodayVerse, []);
  const nextEvent = useMemo(getNextEvent, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const formattedTime = useMemo(
    () =>
      now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    [now],
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Greeting bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
            <GreetingIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-foreground">
              {greetingText}
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location ||
                (coords
                  ? `${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)}`
                  : "Enable location")}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">
            {formattedTime}
          </p>
          {hijriDate && (
            <p className="text-[11px] text-muted-foreground">{hijriDate}</p>
          )}
        </div>
      </motion.div>

      {/* Prayer card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-700 p-5 sm:p-6 shadow-lg shadow-emerald-900/20"
      >
        {/* Decorative layers */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.04)_0%,transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 0L32 16L16 32L0 16Z' fill='white' fill-opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: "32px 32px",
          }}
        />
        <svg
          className="absolute -bottom-6 -right-6 w-48 h-48 text-white opacity-[0.03] pointer-events-none"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 15 L55 22 L55 35 L65 35 L65 40 L55 40 L55 55 L65 55 L65 70 L50 70 L35 70 L35 55 L45 55 L45 40 L35 40 L35 35 L45 35 L45 22 L50 15Z M35 70 L30 70 L30 75 L70 75 L70 70 L65 70 M42 75 L42 85 L58 85 L58 75"
            fill="currentColor"
          />
        </svg>

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[11px] font-medium text-emerald-100/80 uppercase tracking-wider">
                {currentPrayer ? "Current Prayer" : "Loading..."}
              </p>
              {currentPrayer && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-emerald-100/80">
                  Ongoing
                </span>
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-0.5">
              {currentPrayer?.name ?? "—"}
            </p>
            <div className="w-8 h-0.5 bg-emerald-400/50 rounded-full my-2" />
            <p className="text-sm text-emerald-100/80">
              {currentPrayer?.time ?? ""}
            </p>
          </div>

          {nextPrayer && (
            <div className="text-right">
              <p className="text-[11px] font-medium text-emerald-100/80 uppercase tracking-wider">
                Next: {nextPrayer.name}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-0.5 tabular-nums">
                {nextPrayerCountdown}
              </p>
              <p className="text-sm text-emerald-100/80 mt-1">
                {nextPrayer.time}
              </p>
            </div>
          )}
        </div>

        {/* Quick action links */}
        <div className="relative z-10 mt-4 pt-3 border-t border-emerald-500/40 flex items-center gap-3">
          <button
            onClick={() => scrollTo("prayer-times")}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-100 hover:text-white transition-colors"
          >
            <Clock className="w-3 h-3" />
            All Times
          </button>
          <button
            onClick={() => scrollTo("qibla")}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-100 hover:text-white transition-colors"
          >
            <Compass className="w-3 h-3" />
            Qibla
          </button>
          <button
            onClick={() => scrollTo("mosques")}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-100 hover:text-white transition-colors"
          >
            <MapPin className="w-3 h-3" />
            Mosques
          </button>
        </div>
      </motion.div>

      {/* Quick info grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {/* Qibla */}
        <button
          onClick={() => scrollTo("qibla")}
          className="flex flex-col items-center gap-2 rounded-xl bg-card border border-border p-4 transition-all hover:shadow-sm hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Qibla</p>
            <p className="text-sm font-semibold text-foreground">
              {qibla !== null ? `${qibla}°` : "—"}
            </p>
          </div>
        </button>

        {/* Nearby Mosques */}
        <button
          onClick={() => scrollTo("mosques")}
          className="flex flex-col items-center gap-2 rounded-xl bg-card border border-border p-4 transition-all hover:shadow-sm hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Mosques</p>
            <p className="text-sm font-semibold text-foreground">
              {nearbySummary ? `${nearbySummary.count} nearby` : "—"}
            </p>
            {nearbySummary?.closest && (
              <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                {nearbySummary.closest.distance} km
              </p>
            )}
          </div>
        </button>

        {/* Hijri */}
        <div className="flex flex-col items-center gap-2 rounded-xl bg-card border border-border p-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <Moon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Hijri</p>
            <p className="text-sm font-semibold text-foreground">
              {hijriDate?.split(" ").slice(0, 3).join(" ") || "—"}
            </p>
          </div>
        </div>

        {/* Next Event */}
        <button
          onClick={() => scrollTo("calendar")}
          className="flex flex-col items-center gap-2 rounded-xl bg-card border border-border p-4 transition-all hover:shadow-sm hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Next Event</p>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {nextEvent ? nextEvent.name : "—"}
            </p>
            {nextEvent && (
              <p className="text-[10px] text-muted-foreground">
                {nextEvent.daysUntil > 0
                  ? `${nextEvent.daysUntil} days · ${nextEvent.date}`
                  : "Today!"}
              </p>
            )}
          </div>
        </button>
      </motion.div>

      {/* Daily Verse */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-xl bg-card border border-border p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <BookText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Daily Verse
          </span>
        </div>
        <p className="text-sm sm:text-base text-foreground leading-relaxed italic">
          "{todayVerse.text}"
        </p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {todayVerse.surah} · {todayVerse.verse}
          </p>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {todayVerse.revelation}
          </span>
        </div>
        <button
          onClick={() => scrollTo("verse")}
          className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
        >
          More verses
          <ExternalLink className="w-3 h-3" />
        </button>
      </motion.div>

      {/* Smart Recommendations */}
      <SmartRecommendations
        nextPrayer={nextPrayer}
        nextPrayerCountdown={nextPrayerCountdown}
        nearbyCount={nearbySummary?.count ?? 0}
        scrollTo={scrollTo}
      />
    </div>
  );
}

/* ── Smart Recommendations ── */

function SmartRecommendations({
  nextPrayer,
  nextPrayerCountdown,
  nearbyCount,
  scrollTo,
}: {
  nextPrayer: PrayerTime | undefined;
  nextPrayerCountdown: string | null;
  nearbyCount: number;
  scrollTo: (id: string) => void;
}) {
  const recommendations = useMemo(() => {
    const items: Array<{
      id: string;
      icon: typeof Sparkles;
      title: string;
      desc: string;
      action: string;
      href: string;
      color: string;
      bg: string;
    }> = [];

    // Prayer approaching → nearby mosques
    if (
      nextPrayer &&
      nextPrayerCountdown &&
      !nextPrayerCountdown.includes("h") &&
      !nextPrayerCountdown.includes("Now")
    ) {
      const mins = parseInt(nextPrayerCountdown);
      if (mins <= 30 && nearbyCount > 0) {
        items.push({
          id: "mosque-nearby",
          icon: MapPin,
          title: `${nextPrayer.name} begins in ${nextPrayerCountdown}`,
          desc: `${nearbyCount} mosque${nearbyCount > 1 ? "s" : ""} available nearby`,
          action: "Find Mosque",
          href: "mosques",
          color: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-100 dark:bg-emerald-900/30",
        });
      }
    }

    // Friday → Jumu'ah
    if (new Date().getDay() === 5) {
      items.push({
        id: "jumuah",
        icon: Clock,
        title: "Today is Friday",
        desc: "Check Jumu'ah prayer times at nearby mosques",
        action: "View Mosques",
        href: "mosques",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-900/30",
      });
    }

    // General Qibla prompt for travelers (not time-specific)
    items.push({
      id: "qibla-prompt",
      icon: Compass,
      title: "Need to pray?",
      desc: "Open the Qibla compass to find the direction of the Kaaba",
      action: "Open Qibla",
      href: "qibla",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    });

    return items;
  }, [nextPrayer, nextPrayerCountdown, nearbyCount]);

  if (recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Suggestions
        </span>
      </div>

      <div className="space-y-2">
        {recommendations.map((r) => (
          <button
            key={r.id}
            onClick={() => scrollTo(r.href)}
            className="w-full flex items-start gap-3 rounded-xl bg-card border border-border p-4 transition-all hover:shadow-sm hover:-translate-y-0.5 text-left"
          >
            <div
              className={`w-10 h-10 rounded-xl ${r.bg} flex items-center justify-center shrink-0 mt-0.5`}
            >
              <r.icon className={`w-4 h-4 ${r.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{r.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
            </div>
            <span className="shrink-0 text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
              {r.action} →
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

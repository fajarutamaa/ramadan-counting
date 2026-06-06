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
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudFog,
  Wind,
  Droplets,
  Eye,
  CloudLightning,
} from "lucide-react";
import { fetchNearbyMosques, type Mosque } from "@/lib/mosqueApi";
import { usePrayerTimes, type PrayerTime } from "@/hooks/usePrayerTimes";
import { useIslamicEvents } from "@/hooks/useIslamicEvents";
import { quranVerses } from "@/lib/quranVerses";
import { calcQibla } from "@/lib/qibla";

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

function getWeatherDesc(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Drizzle";
  if (code <= 77) return "Rain";
  if (code <= 82) return "Heavy rain";
  if (code <= 99) return "Thunderstorm";
  return "Cloudy";
}

function getWeatherIcon(code: number): typeof Sun {
  if (code === 0) return Sun;
  if (code <= 3) return Cloud;
  if (code <= 48) return CloudFog;
  if (code <= 77) return CloudRain;
  if (code <= 82) return CloudDrizzle;
  if (code <= 99) return CloudLightning;
  return Cloud;
}

function getTodayVerse() {
  const day = new Date().getDate();
  return quranVerses[day % quranVerses.length];
}

interface HomeDashboardProps {
  coords: { lat: number; lon: number } | null;
  location: string;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  visibility: number;
  weatherLoading: boolean;
  weatherError: string | null;
}

export function HomeDashboard({
  coords,
  location,
  temperature,
  weatherCode,
  windSpeed,
  humidity,
  visibility,
  weatherLoading,
  weatherError,
}: HomeDashboardProps) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { times: prayerTimes } = usePrayerTimes(coords);
  const { currentHijri: hijriInfo, events: islamicEvents } =
    useIslamicEvents(baseUrl);
  const [nearbySummary, setNearbySummary] = useState<{
    count: number;
    closest: Mosque | null;
  } | null>(null);
  const [now, setNow] = useState(new Date());

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hijriDate = hijriInfo
    ? `${hijriInfo.day} ${hijriInfo.monthEn} ${hijriInfo.year} AH`
    : null;

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

  const nextEvent = useMemo(() => {
    const now = new Date();
    const upcoming = islamicEvents.find((e) => e.date >= now);
    if (!upcoming) return null;
    const diff = Math.ceil(
      (upcoming.date.getTime() - now.getTime()) / 86400000,
    );
    return {
      name: upcoming.name,
      date: upcoming.date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
      }),
      emoji: upcoming.emoji,
      daysUntil: diff,
    };
  }, [islamicEvents]);

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

  const WeatherIcon = useMemo(() => getWeatherIcon(weatherCode), [weatherCode]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Background glow behind hero */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Greeting bar */}
        <div className="relative z-10 flex items-center justify-between">
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
        </div>

        {/* Hero headline */}
        <div className="relative z-10 mt-8 sm:mt-10 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
            Your Daily Muslim Companion
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Accurate prayer times, nearby mosques, Qibla direction, Islamic
            calendar, and essential tools for your daily spiritual journey.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => scrollTo("prayer-times")}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 text-sm font-semibold transition-all shadow-lg shadow-emerald-600/25"
            >
              <Clock className="w-4 h-4" />
              Explore Tools
            </button>
            <button
              onClick={() => scrollTo("features")}
              className="inline-flex items-center gap-2 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-2.5 text-sm font-semibold transition-all"
            >
              <Sparkles className="w-4 h-4" />
              View Features
            </button>
          </div>
        </div>
      </motion.div>

      {/* Prayer card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-700 p-5 sm:p-6 shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:shadow-emerald-900/30 transition-all duration-300 hover:-translate-y-0.5"
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
              <p
                className="text-2xl sm:text-3xl font-bold text-white mt-0.5 tabular-nums"
                style={{ textShadow: "0 0 20px rgba(255,255,255,0.12)" }}
              >
                {nextPrayerCountdown}
              </p>
              <p className="text-sm text-emerald-100/80 mt-1">
                {nextPrayer.time}
              </p>
            </div>
          )}
        </div>

        {/* Quick action links */}
        <div className="relative z-10 mt-4 pt-3 border-t border-emerald-500/40">
          {/* Weather summary */}
          {!weatherLoading && !weatherError && (
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <WeatherIcon className="w-4 h-4 text-emerald-100/80" />
                <span className="text-sm text-emerald-100/80">
                  {temperature}° · {getWeatherDesc(weatherCode)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-emerald-100/60">
                <span className="inline-flex items-center gap-1">
                  <Wind className="w-2.5 h-2.5" />
                  {windSpeed} km/h
                </span>
                <span className="inline-flex items-center gap-1">
                  <Droplets className="w-2.5 h-2.5" />
                  {humidity}%
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" />
                  {visibility} km
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
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
            <span className="ml-auto flex items-center gap-2">
              {location && (
                <span className="text-[10px] text-emerald-100/60 inline-flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {location}
                </span>
              )}
              {hijriDate && (
                <span className="text-[10px] text-emerald-100/60">
                  {hijriDate}
                </span>
              )}
            </span>
          </div>
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
          className="relative group flex flex-col items-center gap-2 rounded-xl bg-card border border-border/80 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-500/30 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
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
          className="relative group flex flex-col items-center gap-2 rounded-xl bg-card border border-border/80 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-500/30 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
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
        <div className="relative group flex flex-col items-center gap-2 rounded-xl bg-card border border-border/80 p-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
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
          className="relative group flex flex-col items-center gap-2 rounded-xl bg-card border border-border/80 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-500/30 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:scale-105 transition-transform">
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
        className="rounded-xl bg-card border border-border/80 p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-emerald-500/30"
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
            className="w-full group flex items-start gap-3 rounded-xl bg-card border border-border/80 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-500/30 shadow-sm text-left"
          >
            <div
              className={`w-10 h-10 rounded-xl ${r.bg} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}
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

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
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
import { formatMosqueDistance, type Mosque } from "@/lib/mosqueApi";
import type { PrayerTime, PrayerTimesData } from "@/hooks/usePrayerTimes";
import type { IslamicEvent } from "@/hooks/useIslamicEvents";
import type { HijriDateInfo } from "@/hooks/useHijriDates";
import { quranVerses } from "@/lib/quranVerses";
import { calcQibla } from "@/lib/qibla";
import { QuickAccess } from "@/components/QuickAccess";
import { cn } from "@/lib/utils";
import { RamadanSummary, type RamadanInfo } from "@/components/RamadanSummary";
import {
  LocationPicker,
  type LocationPickerProps,
} from "@/components/LocationPicker";

/* ── Helpers ── */

function getGreeting(h: number): { text: string; Icon: typeof Sun } {
  if (h < 5) return { text: "Blessed Night", Icon: Moon };
  if (h < 12) return { text: "Good Morning", Icon: Sunrise };
  if (h < 17) return { text: "Good Afternoon", Icon: Sun };
  if (h < 20) return { text: "Good Evening", Icon: Sunset };
  return { text: "Peaceful Evening", Icon: CloudMoon };
}

function formatCountdown(mins: number | null): string {
  if (mins === null) return "Tomorrow";
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

export interface NextEventInfo {
  name: string;
  date: string;
  emoji: string;
  daysUntil: number;
}

/* ── Sub-components ── */

interface HeroSectionProps {
  greetingText: string;
  GreetingIcon: typeof Sun;
  location: string;
  coords: { lat: number; lon: number } | null;
  formattedTime: string;
  hijriDate: string | null;
  locating: boolean;
}

function HeroSection({
  greetingText,
  GreetingIcon,
  location,
  coords,
  formattedTime,
  hijriDate,
  locating,
}: HeroSectionProps) {
  return (
    <div className="self-center">
      <p className="section-label flex items-center gap-2 text-primary">
        <GreetingIcon aria-hidden="true" className="size-4" />
        {greetingText}
      </p>
      <h1 className="font-display mt-4 text-[clamp(2.75rem,6vw,4.75rem)] leading-[1.02] tracking-[-0.045em]">
        Your daily Muslim{" "}
        <em className="font-normal text-primary">companion.</em>
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        Prayer times, the Qibla, and space for daily reflection, all in one
        place.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground sm:text-sm">
        <span className="inline-flex items-center gap-1.5">
          <MapPin
            aria-hidden="true"
            className="size-3.5 shrink-0 text-primary"
          />
          {location ||
            (coords
              ? `${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)}`
              : locating
                ? "Finding device location…"
                : "Location not set")}
        </span>
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Clock aria-hidden="true" className="size-3.5 text-primary" />
          {formattedTime}
        </span>
        {hijriDate && <span>{hijriDate}</span>}
      </div>
    </div>
  );
}

interface PrayerCardProps {
  currentPrayer: Pick<PrayerTime, "name" | "time"> | undefined;
  nextPrayer: PrayerTimesData["nextPrayer"];
  nextPrayerCountdown: string;
  hasLocation: boolean;
  locating: boolean;
  locationPicker: LocationPickerProps;
  prayerLoading: boolean;
  offline: boolean;
  savedLocation: string | null;
  prayers: PrayerTimesData;
  ramadan: RamadanInfo | null;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  visibility: number;
  weatherLoading: boolean;
  weatherError: string | null;
}

function PrayerCard({
  currentPrayer,
  nextPrayer,
  nextPrayerCountdown,
  hasLocation,
  locating,
  locationPicker,
  prayerLoading,
  offline,
  savedLocation,
  prayers,
  ramadan,
  temperature,
  weatherCode,
  windSpeed,
  humidity,
  visibility,
  weatherLoading,
  weatherError,
}: PrayerCardProps) {
  const WeatherIcon = getWeatherIcon(weatherCode);

  return (
    <section
      aria-labelledby="prayer-summary"
      className="prayer-panel relative isolate flex min-h-64 flex-col overflow-hidden rounded-3xl p-5 text-white sm:p-7"
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -right-9 -bottom-28 -z-10 w-60 text-[#e2c790]/20 sm:w-72"
        viewBox="0 0 240 280"
        fill="none"
        stroke="currentColor"
      >
        <path d="M20 280V148C20 83 72 57 120 20c48 37 100 63 100 128v132" />
        <path d="M35 280V149c0-56 44-81 85-111 41 30 85 55 85 111v131" />
        <path d="M50 280V151c0-48 36-69 70-95 34 26 70 47 70 95v129" />
        <path d="M65 280V153c0-39 28-59 55-79 27 20 55 40 55 79v127" />
      </svg>

      <h2
        id="prayer-summary"
        className="section-label flex items-center gap-2 text-[#e2c790]"
      >
        {ramadan ? (
          <Moon aria-hidden="true" className="size-4" />
        ) : (
          <Clock aria-hidden="true" className="size-4" />
        )}
        {ramadan ? `Ramadan · Day ${ramadan.day}` : "Prayer today"}
      </h2>
      <div className="my-5 flex flex-1 flex-wrap items-start justify-between gap-4">
        {ramadan ? (
          <RamadanSummary prayers={prayers} ramadan={ramadan} />
        ) : currentPrayer || nextPrayer ? (
          <>
            {currentPrayer && (
              <div>
                <p className="text-xs font-medium text-white/75">
                  Current prayer
                </p>
                <p className="font-display mt-1 text-4xl">
                  {currentPrayer.name}
                </p>
                <p className="mt-1 text-sm text-white/75">
                  {currentPrayer.time}
                </p>
              </div>
            )}
            {nextPrayer && (
              <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2.5">
                <p className="text-xs text-white/80">
                  Next · {nextPrayer.name}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums">
                  {nextPrayerCountdown}
                </p>
                {nextPrayer.time && (
                  <p className="text-xs text-white/75">{nextPrayer.time}</p>
                )}
              </div>
            )}
          </>
        ) : (
          <div>
            <p className="font-display text-3xl">Local prayer times</p>
            <p
              role="status"
              className="mt-2 max-w-xs text-sm leading-relaxed text-white/80"
            >
              {offline
                ? "No saved prayer schedule for today. Open the schedule online first."
                : locating
                  ? "Finding your device location… You can also choose a city."
                  : !hasLocation
                    ? "Choose a city or allow device location to see your local schedule."
                    : prayerLoading
                      ? "Loading your local prayer schedule…"
                      : "Your local schedule is temporarily unavailable."}
            </p>
          </div>
        )}
      </div>
      {!ramadan && savedLocation && (
        <p className="mb-3 text-xs text-white/80">
          Saved schedule · {savedLocation}
        </p>
      )}

      <div className="border-t border-white/20 pt-3">
        {hasLocation && !weatherLoading && !weatherError && (
          <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <WeatherIcon aria-hidden="true" className="size-4" />
              {temperature}° · {getWeatherDesc(weatherCode)}
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1">
                <Wind aria-label="Wind" className="size-3" />
                {windSpeed} km/h
              </span>
              <span className="inline-flex items-center gap-1">
                <Droplets aria-label="Humidity" className="size-3" />
                {humidity}%
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye aria-label="Visibility" className="size-3" />
                {visibility} km
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {ramadan && (
            <a
              href="#fasting-log"
              className="inline-flex min-h-9 items-center gap-2 rounded-sm text-sm font-semibold hover:underline"
            >
              Open fasting log{" "}
              <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          )}
          <LocationPicker {...locationPicker} hasLocation={hasLocation} />
          {(hasLocation || savedLocation) && (
            <a
              href="#prayer-times"
              className="inline-flex min-h-9 items-center gap-2 rounded-sm text-sm font-semibold hover:underline"
            >
              View prayer schedule
              <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

interface QuickInfoGridProps {
  qibla: number | null;
  nearbySummary: { count: number; closest: Mosque | null } | null;
  hijriDate: string | null;
  nextEvent: NextEventInfo | null;
  scrollTo: (id: string) => void;
}

function QuickInfoGrid({
  qibla,
  nearbySummary,
  hijriDate,
  nextEvent,
  scrollTo,
}: QuickInfoGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-4"
    >
      <InfoCard
        icon={Compass}
        label="Qibla"
        value={qibla !== null ? `${qibla}°` : "—"}
        onClick={() => scrollTo("qibla")}
      />
      <InfoCard
        icon={MapPin}
        label="Places to pray"
        value={nearbySummary ? `${nearbySummary.count} nearby` : "—"}
        subtitle={
          nearbySummary?.closest?.distance !== undefined
            ? formatMosqueDistance(nearbySummary.closest.distance)
            : undefined
        }
        onClick={() => scrollTo("mosques")}
      />
      <InfoCard
        icon={Moon}
        label="Hijri"
        value={hijriDate?.split(" ").slice(0, 3).join(" ") || "—"}
      />
      <InfoCard
        icon={Star}
        label="Next Event"
        value={nextEvent ? nextEvent.name : "—"}
        subtitle={
          nextEvent
            ? nextEvent.daysUntil > 0
              ? `${nextEvent.daysUntil} days · ${nextEvent.date}`
              : "Today!"
            : undefined
        }
        onClick={() => scrollTo("calendar")}
      />
    </motion.div>
  );
}

interface InfoCardProps {
  icon: typeof Sun;
  label: string;
  value: string;
  subtitle?: string;
  onClick?: () => void;
}

function InfoCard({
  icon: Icon,
  label,
  value,
  subtitle,
  onClick,
}: InfoCardProps) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "min-w-0 bg-card p-3 text-left focus-visible:-outline-offset-2 sm:p-4",
        onClick && "cursor-pointer transition-colors hover:bg-secondary",
      )}
    >
      <p className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
        {label}
      </p>
      <div>
        <p className="text-sm font-semibold text-foreground">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </Wrapper>
  );
}

interface DailyVerseCardProps {
  verse: (typeof quranVerses)[number];
  scrollTo: (id: string) => void;
}

function DailyVerseCard({ verse, scrollTo }: DailyVerseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl border bg-card p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <BookText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Daily Verse
        </span>
      </div>
      <blockquote className="font-display text-lg leading-relaxed">
        &ldquo;{verse.text}&rdquo;
      </blockquote>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {verse.surah} · {verse.verse}
        </p>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
          {verse.revelation}
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
  );
}

/* ── Smart Recommendations ── */

function SmartRecommendations({
  nextPrayer,
  minutesUntilNext,
  isFriday,
  nearbyCount,
  scrollTo,
}: {
  nextPrayer: PrayerTimesData["nextPrayer"];
  minutesUntilNext: number | null;
  isFriday: boolean;
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
    }> = [];

    if (
      nextPrayer &&
      minutesUntilNext !== null &&
      minutesUntilNext <= 30 &&
      nearbyCount > 0
    ) {
      items.push({
        id: "mosque-nearby",
        icon: MapPin,
        title: `${nextPrayer.name} begins in ${minutesUntilNext} min`,
        desc: `${nearbyCount} mapped ${nearbyCount === 1 ? "place" : "places"} to pray nearby`,
        action: "View map",
        href: "mosques",
      });
    }

    if (isFriday) {
      items.push({
        id: "jumuah",
        icon: Clock,
        title: "Today is Friday",
        desc: "Find a nearby mosque and confirm its Jumu'ah schedule before visiting",
        action: "View Mosques",
        href: "mosques",
      });
    }

    return items;
  }, [nextPrayer, minutesUntilNext, nearbyCount, isFriday]);

  if (recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="rounded-2xl border bg-card p-5 sm:p-6"
    >
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Suggestions
        </span>
      </div>

      <div className="space-y-2">
        {recommendations.map((r) => (
          <button
            key={r.id}
            onClick={() => scrollTo(r.href)}
            className="flex w-full flex-wrap items-start gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-secondary"
          >
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <r.icon className="size-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{r.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
            </div>
            <span className="mt-0.5 shrink-0 text-xs font-medium text-primary">
              {r.action} →
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Props ── */

interface HomeDashboardProps {
  coords: { lat: number; lon: number } | null;
  location: string;
  locating: boolean;
  locationPicker: LocationPickerProps;
  prayers: PrayerTimesData;
  hijriInfo: HijriDateInfo | null;
  islamicEvents: IslamicEvent[];
  ramadan: RamadanInfo | null;
  nearbyMosques: Mosque[] | null;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  visibility: number;
  weatherLoading: boolean;
  weatherError: string | null;
}

/* ── Main component ── */

export function HomeDashboard({
  coords,
  location,
  locating,
  locationPicker,
  prayers,
  hijriInfo,
  islamicEvents,
  ramadan,
  nearbyMosques,
  temperature,
  weatherCode,
  windSpeed,
  humidity,
  visibility,
  weatherLoading,
  weatherError,
}: HomeDashboardProps) {
  const { today, currentPrayer, nextPrayer, minutesUntilNext } = prayers;
  const timeZone = locationPicker.city?.timeZone;
  const nearbySummary = nearbyMosques
    ? { count: nearbyMosques.length, closest: nearbyMosques[0] ?? null }
    : null;
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);

  const hijriDate = hijriInfo
    ? `${hijriInfo.day} ${hijriInfo.monthEn} ${hijriInfo.year} AH`
    : null;

  const hour = Number(
    now.toLocaleTimeString("en-GB", {
      timeZone,
      hour: "numeric",
      hourCycle: "h23",
    }),
  );
  const { text: greetingText, Icon: GreetingIcon } = getGreeting(hour);
  const isFriday =
    now.toLocaleDateString("en-US", { timeZone, weekday: "short" }) === "Fri";

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
    if (el) el.scrollIntoView({ block: "start" });
  }, []);

  const formattedTime = useMemo(
    () =>
      now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone,
      }),
    [now, timeZone],
  );

  return (
    <div className="space-y-7 sm:space-y-9">
      <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-stretch lg:gap-12">
        <HeroSection
          greetingText={greetingText}
          GreetingIcon={GreetingIcon}
          location={location}
          coords={coords}
          formattedTime={formattedTime}
          hijriDate={hijriDate}
          locating={locating}
        />

        <PrayerCard
          currentPrayer={currentPrayer}
          nextPrayer={nextPrayer}
          nextPrayerCountdown={formatCountdown(minutesUntilNext)}
          hasLocation={!!coords}
          locating={locating}
          locationPicker={locationPicker}
          prayerLoading={today.loading}
          offline={!prayers.online}
          savedLocation={today.fromCache ? prayers.location : null}
          prayers={prayers}
          ramadan={ramadan}
          temperature={temperature}
          weatherCode={weatherCode}
          windSpeed={windSpeed}
          humidity={humidity}
          visibility={visibility}
          weatherLoading={weatherLoading}
          weatherError={weatherError}
        />
      </div>

      <QuickAccess />

      <div className="space-y-3">
        <h2 className="section-label">At a glance</h2>
        <QuickInfoGrid
          qibla={qibla}
          nearbySummary={nearbySummary}
          hijriDate={hijriDate}
          nextEvent={nextEvent}
          scrollTo={scrollTo}
        />

        <DailyVerseCard verse={todayVerse} scrollTo={scrollTo} />

        <SmartRecommendations
          nextPrayer={nextPrayer}
          minutesUntilNext={minutesUntilNext}
          isFriday={isFriday}
          nearbyCount={nearbySummary?.count ?? 0}
          scrollTo={scrollTo}
        />
      </div>
    </div>
  );
}

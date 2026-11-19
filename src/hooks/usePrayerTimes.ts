import { useEffect, useMemo, useState } from "react";
import type { Coords } from "./useGeolocation";

const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

type Timings = Record<(typeof prayerNames)[number], string>;

export interface PrayerTime {
  name: string;
  time: string;
  isCurrent: boolean;
  isNext: boolean;
}

export interface PrayerTimesData {
  times: PrayerTime[];
  nextPrayer: { name: string; time: string | null } | null;
  minutesUntilNext: number | null;
  loading: boolean;
  error: string | null;
}

function minutesOfDay(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function usePrayerTimes(
  coords: Coords | null,
  timeZone?: string,
): PrayerTimesData {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = window.setInterval(refresh, 10_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const clock = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }),
    [timeZone],
  );
  const parts = Object.fromEntries(
    clock.formatToParts(now).map(({ type, value }) => [type, value]),
  );
  const date = `${parts.day}-${parts.month}-${parts.year}`;
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const url = useMemo(() => {
    if (!coords) return null;
    const params = new URLSearchParams({
      latitude: String(coords.lat),
      longitude: String(coords.lon),
      method: "2",
    });
    if (timeZone) params.set("timezonestring", timeZone);
    return `https://api.aladhan.com/v1/timings/${date}?${params}`;
  }, [coords, date, timeZone]);
  const [response, setResponse] = useState<{
    url: string;
    timings?: Timings;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    async function load(requestUrl: string) {
      try {
        const res = await fetch(requestUrl, { signal: controller.signal });
        const data = await res.json();
        const timings: Timings | undefined = data.data?.timings;
        if (
          !res.ok ||
          data.code !== 200 ||
          !timings ||
          !prayerNames.every((name) => /^\d{2}:\d{2}$/.test(timings[name]))
        ) {
          throw new Error("Invalid prayer schedule");
        }
        if (!controller.signal.aborted)
          setResponse({ url: requestUrl, timings });
      } catch {
        if (!controller.signal.aborted)
          setResponse({
            url: requestUrl,
            error: "Failed to fetch prayer times",
          });
      }
    }
    void load(url);
    return () => controller.abort();
  }, [url]);

  const schedule = response?.url === url ? response : null;
  const timings = schedule?.timings;
  if (!timings) {
    return {
      times: [],
      nextPrayer: null,
      minutesUntilNext: null,
      loading: !!url && !schedule,
      error: schedule?.error ?? null,
    };
  }

  const nextIndex = prayerNames.findIndex(
    (name) => minutesOfDay(timings[name]) > minutes,
  );
  const currentIndex =
    nextIndex === -1 ? prayerNames.length - 1 : nextIndex - 1;
  const nextName = prayerNames[Math.max(0, nextIndex)];
  const nextTime = nextIndex === -1 ? null : timings[nextName];

  return {
    times: prayerNames.map((name, index) => ({
      name,
      time: timings[name],
      isCurrent: index === currentIndex,
      isNext: index === nextIndex,
    })),
    nextPrayer: { name: nextName, time: nextTime },
    minutesUntilNext: nextTime ? minutesOfDay(nextTime) - minutes : null,
    loading: false,
    error: null,
  };
}

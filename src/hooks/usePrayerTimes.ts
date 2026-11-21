import { useEffect, useMemo, useState } from "react";
import type { Coords } from "./useGeolocation";
import {
  adjustPrayerTimes,
  fetchPrayerDay,
  loadPrayerCache,
  persistPrayerCache,
  prayerDayKey,
  savePrayerDay,
  shiftPrayerDate,
  type PrayerName,
  type PrayerPlace,
  type PrayerSettings,
} from "@/lib/prayerSchedule";

export interface PrayerTime {
  name: PrayerName;
  time: string;
  dayOffset: number;
  isCurrent: boolean;
  isNext: boolean;
}

interface PrayerDay {
  date: string;
  times: PrayerTime[];
  loading: boolean;
  fromCache: boolean;
}

export interface PrayerTimesData {
  activePlace: Omit<PrayerPlace, "label"> | null;
  today: PrayerDay;
  tomorrow: PrayerDay;
  location: string | null;
  timeZone: string;
  usingLastDevice: boolean;
  online: boolean;
  canRefresh: boolean;
  retry: () => void;
  currentPrayer: Pick<PrayerTime, "name" | "time"> | undefined;
  nextPrayer: { name: PrayerName; time: string | null } | null;
  minutesUntilNext: number | null;
}

interface Options {
  settings: PrayerSettings;
  cityName?: string;
  cityTimeZone?: string;
  deviceLabel?: string;
}

export function usePrayerTimes(
  coords: Coords | null,
  { settings, cityName, cityTimeZone, deviceLabel }: Options,
): PrayerTimesData {
  const [now, setNow] = useState(() => new Date());
  const [online, setOnline] = useState(() => navigator.onLine);
  const [cache, setCache] = useState(loadPrayerCache);
  const [retryCount, setRetryCount] = useState(0);
  const [request, setRequest] = useState<{
    key: string;
    received: Record<string, boolean>;
  } | null>(null);

  useEffect(() => {
    const refreshTime = () => setNow(new Date());
    const refreshConnection = () => {
      refreshTime();
      setOnline(navigator.onLine);
    };
    const timer = window.setInterval(refreshTime, 10_000);
    document.addEventListener("visibilitychange", refreshConnection);
    window.addEventListener("online", refreshConnection);
    window.addEventListener("offline", refreshConnection);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshConnection);
      window.removeEventListener("online", refreshConnection);
      window.removeEventListener("offline", refreshConnection);
    };
  }, []);

  const deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Use consistent precision for cache keys and don't store exact GPS fixes.
  const lat = coords ? Number(coords.lat.toFixed(3)) : null;
  const lon = coords ? Number(coords.lon.toFixed(3)) : null;
  const activePlace = useMemo(
    () =>
      lat === null || lon === null
        ? null
        : { lat, lon, timeZone: cityTimeZone ?? deviceTimeZone },
    [lat, lon, cityTimeZone, deviceTimeZone],
  );
  const usingLastDevice =
    activePlace === null && !cityName && cache.lastDevice !== null;
  const place = activePlace ?? (usingLastDevice ? cache.lastDevice : null);
  const timeZone = place?.timeZone ?? deviceTimeZone;
  const lastDevice = cache.lastDevice;
  const rememberedLabel =
    activePlace &&
    lastDevice?.lat === activePlace.lat &&
    lastDevice.lon === activePlace.lon &&
    lastDevice.timeZone === activePlace.timeZone
      ? lastDevice.label
      : undefined;
  const location = activePlace
    ? cityName ||
      deviceLabel ||
      rememberedLabel ||
      `${activePlace.lat.toFixed(3)}, ${activePlace.lon.toFixed(3)}`
    : usingLastDevice
      ? (lastDevice?.label ?? null)
      : null;
  const method = settings.method;
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
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const tomorrowDate = shiftPrayerDate(date, 1);
  const yesterdayDate = shiftPrayerDate(date, -1);
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const todayKey = place ? prayerDayKey(place, date, method) : null;
  const tomorrowKey = place ? prayerDayKey(place, tomorrowDate, method) : null;
  const yesterdayKey = place
    ? prayerDayKey(place, yesterdayDate, method)
    : null;
  const requestKey =
    activePlace && todayKey ? `${todayKey}:${retryCount}` : null;
  const todaySaved = todayKey ? cache.days[todayKey] : undefined;
  const tomorrowSaved = tomorrowKey ? cache.days[tomorrowKey] : undefined;
  const yesterdaySaved = yesterdayKey ? cache.days[yesterdayKey] : undefined;

  useEffect(() => {
    if (!activePlace || !online || !requestKey) return;
    const controller = new AbortController();
    const { signal } = controller;
    const placeForRequest = activePlace;
    const batch = requestKey;
    function finish(day: string, received: boolean) {
      setRequest((previous) => ({
        key: batch,
        received: {
          ...(previous?.key === batch ? previous.received : {}),
          [day]: received,
        },
      }));
    }
    async function load(day: string) {
      try {
        const timings = await fetchPrayerDay(
          placeForRequest,
          day,
          method,
          signal,
        );
        if (signal.aborted) return;
        setCache((previous) =>
          savePrayerDay(
            previous,
            prayerDayKey(placeForRequest, day, method),
            timings,
          ),
        );
        finish(day, true);
      } catch {
        if (!signal.aborted) finish(day, false);
      }
    }
    queueMicrotask(() => {
      if (signal.aborted) return;
      void load(date);
      void load(tomorrowDate);
    });
    return () => controller.abort();
  }, [activePlace, online, requestKey, date, tomorrowDate, method]);

  // Remember the device location only if we have a timetable for it. Update
  // the label when reverse geocoding finishes without restarting the fetch.
  useEffect(() => {
    if (
      !activePlace ||
      cityName ||
      !location ||
      (!todaySaved && !tomorrowSaved)
    )
      return;
    setCache((previous) => {
      const { lastDevice } = previous;
      return lastDevice?.lat === activePlace.lat &&
        lastDevice.lon === activePlace.lon &&
        lastDevice.timeZone === activePlace.timeZone &&
        lastDevice.label === location
        ? previous
        : { ...previous, lastDevice: { ...activePlace, label: location } };
    });
  }, [activePlace, cityName, location, todaySaved, tomorrowSaved]);

  useEffect(() => persistPrayerCache(cache), [cache]);

  const todayTimes = todaySaved
    ? adjustPrayerTimes(todaySaved.timings, settings.offsets)
    : [];
  const tomorrowTimes = tomorrowSaved
    ? adjustPrayerTimes(tomorrowSaved.timings, settings.offsets)
    : [];
  // A manual adjustment can move a prayer across midnight. Keep its source
  // date on the timetable while using its actual wall-clock day for highlights.
  const yesterdaySpill = yesterdaySaved
    ? adjustPrayerTimes(yesterdaySaved.timings, settings.offsets)
        .filter(({ position }) => position >= 1440)
        .map((entry) => ({
          ...entry,
          date: yesterdayDate,
          position: entry.position - 1440,
        }))
    : [];
  const occurrences = todaySaved
    ? [
        ...yesterdaySpill,
        ...todayTimes.map((entry) => ({ ...entry, date })),
        ...tomorrowTimes.map((entry) => ({
          ...entry,
          date: tomorrowDate,
          position: entry.position + 1440,
        })),
      ].sort((a, b) => a.position - b.position)
    : [];
  const next = occurrences.find((entry) => entry.position > minutes);
  const current = occurrences
    .filter((entry) => entry.position <= minutes)
    .at(-1);
  const canRefresh = !!activePlace && online;
  const received = request?.key === requestKey ? request?.received : undefined;

  function buildDay(day: string, entries: typeof todayTimes): PrayerDay {
    return {
      date: day,
      times: entries.map(({ name, time, dayOffset }) => ({
        name,
        time,
        dayOffset,
        isCurrent: current?.date === day && current.name === name,
        isNext: next?.date === day && next.name === name,
      })),
      fromCache:
        entries.length > 0 && (!canRefresh || received?.[day] !== true),
      loading:
        entries.length === 0 && canRefresh && received?.[day] === undefined,
    };
  }

  return {
    activePlace,
    today: buildDay(date, todayTimes),
    tomorrow: buildDay(tomorrowDate, tomorrowTimes),
    location,
    timeZone,
    usingLastDevice,
    online,
    canRefresh,
    retry: () => setRetryCount((count) => count + 1),
    currentPrayer: current
      ? { name: current.name, time: current.time }
      : undefined,
    nextPrayer: next
      ? { name: next.name, time: next.time }
      : todaySaved
        ? { name: "Fajr", time: null }
        : null,
    minutesUntilNext:
      next && next.position < 1440 ? next.position - minutes : null,
  };
}

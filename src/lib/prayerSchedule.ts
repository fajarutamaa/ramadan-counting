import type { Coords } from "@/hooks/useGeolocation";

export const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type PrayerName = (typeof prayerNames)[number];
export type Timings = Record<PrayerName, string>;

export const prayerMethods = [
  { id: 20, name: "Kemenag (Indonesia)" },
  { id: 2, name: "ISNA (North America)" },
  { id: 3, name: "Muslim World League" },
  { id: 4, name: "Umm Al-Qura (Makkah)" },
  { id: 5, name: "Egyptian General Authority of Survey" },
  { id: 1, name: "University of Islamic Sciences (Karachi)" },
  { id: 17, name: "JAKIM (Malaysia)" },
  { id: 11, name: "MUIS (Singapore)" },
] as const;

export interface PrayerSettings {
  method: number;
  offsets: Record<PrayerName, number>;
}

export const maxPrayerOffset = 60;
export const defaultPrayerSettings: PrayerSettings = {
  method: 2, // Preserve the existing calculation method until the user opts in.
  offsets: { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 },
};

export function normalizePrayerSettings(
  value: PrayerSettings | null,
): PrayerSettings {
  const offsets = { ...defaultPrayerSettings.offsets };
  for (const name of prayerNames) {
    const minutes = value?.offsets?.[name];
    if (typeof minutes === "number" && Number.isFinite(minutes)) {
      offsets[name] = Math.max(
        -maxPrayerOffset,
        Math.min(maxPrayerOffset, Math.round(minutes)),
      );
    }
  }
  return {
    method:
      prayerMethods.find(({ id }) => id === value?.method)?.id ??
      defaultPrayerSettings.method,
    offsets,
  };
}

export function getPrayerMethodName(method: number) {
  return (
    prayerMethods.find(({ id }) => id === method)?.name ?? prayerMethods[1].name
  );
}

export interface PrayerPlace extends Coords {
  timeZone: string;
  label: string;
}

interface SavedDay {
  timings: Timings;
  fetchedAt: number;
}

export interface PrayerCache {
  days: Record<string, SavedDay>;
  lastDevice: PrayerPlace | null;
}

const cacheKey = "nur.prayerSchedules.v1";
const cacheLimit = 32;

export function isTimings(value: unknown): value is Timings {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<Timings>;
  return prayerNames.every(
    (name) =>
      typeof data[name] === "string" &&
      /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(data[name]),
  );
}

function isValidPlace(
  place: PrayerPlace | undefined | null,
): place is PrayerPlace {
  if (
    !place ||
    !Number.isFinite(place.lat) ||
    !Number.isFinite(place.lon) ||
    Math.abs(place.lat) > 90 ||
    Math.abs(place.lon) > 180 ||
    !place.label ||
    typeof place.label !== "string" ||
    typeof place.timeZone !== "string"
  )
    return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: place.timeZone });
    return true;
  } catch {
    return false;
  }
}

export function loadPrayerCache(): PrayerCache {
  try {
    const cached: Partial<PrayerCache> | null = JSON.parse(
      localStorage.getItem(cacheKey) ?? "null",
    );
    const days = Object.fromEntries(
      Object.entries(cached?.days ?? {}).filter(
        ([, day]) => Number.isFinite(day?.fetchedAt) && isTimings(day.timings),
      ),
    );
    return {
      days,
      lastDevice: isValidPlace(cached?.lastDevice) ? cached.lastDevice : null,
    };
  } catch {
    return { days: {}, lastDevice: null };
  }
}

export function persistPrayerCache(cache: PrayerCache) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cache));
  } catch {
    // A timetable can still be used in this tab if storage is unavailable.
  }
}

export function savePrayerDay(
  cache: PrayerCache,
  key: string,
  timings: Timings,
): PrayerCache {
  const days = { ...cache.days, [key]: { timings, fetchedAt: Date.now() } };
  return {
    lastDevice: cache.lastDevice,
    days: Object.fromEntries(
      Object.entries(days)
        .sort(([, a], [, b]) => b.fetchedAt - a.fetchedAt)
        .slice(0, cacheLimit),
    ),
  };
}

export function prayerDayKey(
  place: Omit<PrayerPlace, "label">,
  date: string,
  method: number,
) {
  return JSON.stringify([place.lat, place.lon, place.timeZone, method, date]);
}

export function shiftPrayerDate(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

export function formatPrayerDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function adjustPrayerTimes(
  timings: Timings,
  offsets: PrayerSettings["offsets"],
) {
  return prayerNames.map((name) => {
    const [hours, minutes] = timings[name].split(":").map(Number);
    const position = hours * 60 + minutes + offsets[name];
    const clock = ((position % 1440) + 1440) % 1440;
    const pad = (value: number) => String(value).padStart(2, "0");
    return {
      name,
      position,
      dayOffset: Math.floor(position / 1440),
      time: `${pad(Math.floor(clock / 60))}:${pad(clock % 60)}`,
    };
  });
}

export function prayerQuery(place: Omit<PrayerPlace, "label">, method: number) {
  return new URLSearchParams({
    latitude: String(place.lat),
    longitude: String(place.lon),
    timezonestring: place.timeZone,
    method: String(method),
  });
}

export async function fetchPrayerDay(
  place: Omit<PrayerPlace, "label">,
  date: string,
  method: number,
  signal: AbortSignal,
): Promise<Timings> {
  const params = prayerQuery(place, method);
  const timestamp = date.split("-").reverse().join("-");
  const requestSignal =
    typeof AbortSignal.any === "function"
      ? AbortSignal.any([signal, AbortSignal.timeout(12_000)])
      : signal;
  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${timestamp}?${params}`,
    { signal: requestSignal },
  );
  if (!response.ok) throw new Error("Prayer schedule request failed");
  const data = await response.json();
  if (data.code !== 200 || !isTimings(data.data?.timings))
    throw new Error("Invalid prayer schedule");
  return data.data.timings;
}

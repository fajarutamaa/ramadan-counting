import { useEffect, useState } from "react";

export interface HijriDateInfo {
  day: number;
  month: number;
  monthAr: string;
  monthEn: string;
  year: number;
}

const storageKey = "nur.hijriDates.v1";
type Dates = Record<string, HijriDateInfo>;

function isHijriDate(
  day: HijriDateInfo | null | undefined,
): day is HijriDateInfo {
  return (
    !!day &&
    Number.isInteger(day.day) &&
    day.day >= 1 &&
    day.day <= 30 &&
    Number.isInteger(day.month) &&
    day.month >= 1 &&
    day.month <= 12 &&
    Number.isInteger(day.year) &&
    day.year > 0 &&
    typeof day.monthAr === "string" &&
    typeof day.monthEn === "string"
  );
}

function loadDates(): Dates {
  try {
    const parsed: Dates | null = JSON.parse(
      localStorage.getItem(storageKey) ?? "null",
    );
    return Object.fromEntries(
      Object.entries(parsed ?? {}).filter(([, info]) => isHijriDate(info)),
    );
  } catch {
    return {};
  }
}

export function useHijriDates(
  baseUrl: string,
  today: string,
  tomorrow: string,
  online: boolean,
) {
  const [dates, setDates] = useState(loadDates);
  const [failedDate, setFailedDate] = useState("");
  const current = dates[today] ?? null;
  const next = dates[tomorrow] ?? null;
  const hasToday = current !== null;
  const hasTomorrow = next !== null;

  useEffect(() => {
    if (!online || (hasToday && hasTomorrow)) return;
    const controller = new AbortController();
    const { signal } = controller;
    const requestSignal =
      typeof AbortSignal.any === "function"
        ? AbortSignal.any([signal, AbortSignal.timeout(12_000)])
        : signal;
    async function load(date: string) {
      try {
        const response = await fetch(
          `${baseUrl}/gToH/${date.split("-").reverse().join("-")}`,
          { signal: requestSignal },
        );
        const data = await response.json();
        const hijri = data.data?.hijri;
        const info: HijriDateInfo = {
          day: Number(hijri?.day),
          month: Number(hijri?.month?.number),
          monthAr: hijri?.month?.ar,
          monthEn: hijri?.month?.en,
          year: Number(hijri?.year),
        };
        if (!response.ok || data.code !== 200 || !isHijriDate(info))
          throw new Error("Invalid Hijri date");
        if (!signal.aborted)
          setDates((previous) =>
            Object.fromEntries(
              Object.entries({ ...previous, [date]: info })
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 8),
            ),
          );
      } catch {
        if (!signal.aborted && date === today) setFailedDate(today);
      }
    }
    queueMicrotask(() => {
      // Load today first; once it is available this effect preloads tomorrow.
      if (!signal.aborted) void load(hasToday ? tomorrow : today);
    });
    return () => controller.abort();
  }, [baseUrl, today, tomorrow, online, hasToday, hasTomorrow]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(dates));
    } catch {
      // Dates are still usable in this tab.
    }
  }, [dates]);

  return {
    current,
    next,
    loading: !hasToday && online && failedDate !== today,
    error: !hasToday && (!online || failedDate === today),
  };
}

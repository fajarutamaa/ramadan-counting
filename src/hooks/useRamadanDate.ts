import { useState, useEffect, useCallback } from "react";

interface Coords {
  lat: number;
  lon: number;
}

interface HijriResponse {
  year: number;
  month: number;
}

function readCachedRamadanDate(): { date: Date; year: string } | null {
  const cached = sessionStorage.getItem("ramadanDate");
  const cachedYear = sessionStorage.getItem("hijriYear");
  if (!cached || !cachedYear) return null;
  const date = new Date(cached);
  if (date.getTime() <= Date.now()) {
    sessionStorage.removeItem("ramadanDate");
    sessionStorage.removeItem("hijriYear");
    return null;
  }
  return { date, year: cachedYear };
}

function writeRamadanDateCache(date: Date, year: string) {
  sessionStorage.setItem("ramadanDate", date.toISOString());
  sessionStorage.setItem("hijriYear", year);
}

async function fetchCurrentHijriData(baseUrl: string): Promise<HijriResponse> {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();

  const res = await fetch(`${baseUrl}/gToH/${dd}-${mm}-${yyyy}`);
  const data = await res.json();

  if (data.code !== 200 || !data.data?.hijri) {
    throw new Error("Failed to get current Hijri date");
  }

  return {
    year: parseInt(data.data.hijri.year),
    month: data.data.hijri.month.number,
  };
}

async function fetchRamadanGregorian(
  baseUrl: string,
  hijriYear: number,
): Promise<Date> {
  const res = await fetch(`${baseUrl}/hToG/9/1/${hijriYear}`);
  const data = await res.json();

  if (data.code !== 200 || !data.data?.gregorian) {
    throw new Error("Failed to get Ramadan date");
  }

  const [day, mon, year] = data.data.gregorian.date.split("-");
  return new Date(Number(year), Number(mon) - 1, Number(day));
}

function computeTargetHijriYear(
  currentMonth: number,
  currentYear: number,
): number {
  return currentMonth <= 9 ? currentYear : currentYear + 1;
}

function needsNextYearRamadan(date: Date): boolean {
  return date.getTime() <= Date.now();
}

export function useRamadanDate(coords: Coords | null, baseUrl: string) {
  const [ramadanDate, setRamadanDate] = useState<Date | null>(null);
  const [hijriYear, setHijriYear] = useState<string>("");

  const getRamadanDate = useCallback(async () => {
    if (!coords) return;

    const cached = readCachedRamadanDate();
    if (cached) {
      setRamadanDate(cached.date);
      setHijriYear(cached.year);
      return;
    }

    try {
      const { year: currentYear, month: currentMonth } =
        await fetchCurrentHijriData(baseUrl);
      const targetYear = computeTargetHijriYear(currentMonth, currentYear);

      let found = await fetchRamadanGregorian(baseUrl, targetYear);
      let year = targetYear;

      if (needsNextYearRamadan(found)) {
        found = await fetchRamadanGregorian(baseUrl, targetYear + 1);
        year = targetYear + 1;
      }

      setRamadanDate(found);
      setHijriYear(String(year));
      writeRamadanDateCache(found, String(year));
    } catch (e) {
      console.error("Failed fetch Ramadan:", e);
      try {
        const fallback = await fetchRamadanGregorian(
          baseUrl,
          new Date().getFullYear() + 1,
        );
        setRamadanDate(fallback);
        return;
      } catch {
        // ignore secondary failure
      }
      const lastResort = new Date();
      lastResort.setFullYear(lastResort.getFullYear() + 1, 1, 1);
      setRamadanDate(lastResort);
    }
  }, [coords, baseUrl]);

  useEffect(() => {
    getRamadanDate();
  }, [coords, getRamadanDate]);

  return { ramadanDate, hijriYear };
}

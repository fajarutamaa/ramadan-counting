import { useState, useEffect, useCallback } from "react";

interface HijriData {
  hijri: {
    month: { number: number };
    day: string;
    year: string;
  };
  gregorian: { date: string };
}

interface ApiResponse {
  data: HijriData[];
}

interface Coords {
  lat: number;
  lon: number;
}

export function useRamadanDate(coords: Coords | null, baseUrl: string) {
  const [ramadanDate, setRamadanDate] = useState<Date | null>(null);
  const [hijriYear, setHijriYear] = useState<string>("");

  const getRamadanDate = useCallback(async () => {
    if (!coords) return;
    const cached = sessionStorage.getItem("ramadanDate");
    const cachedYear = sessionStorage.getItem("hijriYear");

    if (cached && cachedYear) {
      setRamadanDate(new Date(cached));
      setHijriYear(cachedYear);
      return;
    }

    let found: Date | null = null;
    const nextYear = new Date().getFullYear() + 1;

    try {
      const responses = await Promise.all(
        Array.from({ length: 12 }, (_, i) =>
          fetch(
            `${baseUrl}/gToHCalendar/${i + 1}/${nextYear}?latitude=${coords.lat}&longitude=${coords.lon}&method=2`,
          ).then((r) => r.json() as Promise<ApiResponse>),
        ),
      );

      for (const data of responses) {
        const ramadanStart = data.data.find(
          (d) => d.hijri.month.number === 9 && d.hijri.day === "1",
        );
        if (ramadanStart) {
          const [day, mon, year] = ramadanStart.gregorian.date.split("-");
          found = new Date(`${year}-${mon}-${day}T00:00:00+07:00`);
          setHijriYear(ramadanStart.hijri.year);
          sessionStorage.setItem("ramadanDate", found.toISOString());
          sessionStorage.setItem("hijriYear", ramadanStart.hijri.year);
          break;
        }
      }
    } catch (e) {
      console.error("Failed fetch Ramadan:", e);
    }

    if (!found) {
      found = new Date(`${nextYear}-03-01T00:00:00+07:00`);
    }

    setRamadanDate(found);
  }, [coords, baseUrl]);

  useEffect(() => {
    getRamadanDate();
  }, [coords, getRamadanDate]);

  return { ramadanDate, hijriYear };
}

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
      const cachedDate = new Date(cached);
      // Validate cached date is still in the future
      if (cachedDate.getTime() > Date.now()) {
        setRamadanDate(cachedDate);
        setHijriYear(cachedYear);
        return;
      } else {
        // Clear stale cache
        sessionStorage.removeItem("ramadanDate");
        sessionStorage.removeItem("hijriYear");
      }
    }

    let found: Date | null = null;
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    try {
      // Check current year first
      let responses = await Promise.all(
        Array.from({ length: 12 }, (_, i) =>
          fetch(
            `${baseUrl}/gToHCalendar/${i + 1}/${currentYear}?latitude=${coords.lat}&longitude=${coords.lon}&method=2`,
          ).then((r) => r.json() as Promise<ApiResponse>),
        ),
      );

      // Search for Ramadan in current year
      for (const data of responses) {
        const ramadanStart = data.data.find(
          (d) => d.hijri.month.number === 9 && d.hijri.day === "1",
        );
        if (ramadanStart) {
          const [day, mon, year] = ramadanStart.gregorian.date.split("-");
          const ramadanDate = new Date(`${year}-${mon}-${day}T00:00:00+07:00`);

          // Only use this date if it's in the future
          if (ramadanDate.getTime() > Date.now()) {
            found = ramadanDate;
            setHijriYear(ramadanStart.hijri.year);
            sessionStorage.setItem("ramadanDate", found.toISOString());
            sessionStorage.setItem("hijriYear", ramadanStart.hijri.year);
            break;
          }
        }
      }

      // If not found in current year or already passed, check next year
      if (!found) {
        responses = await Promise.all(
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
      }
    } catch (e) {
      console.error("Failed fetch Ramadan:", e);
    }

    if (!found) {
      // Fallback: use next year March 1st if all else fails
      found = new Date(`${nextYear}-03-01T00:00:00+07:00`);
    }

    setRamadanDate(found);
  }, [coords, baseUrl]);

  useEffect(() => {
    getRamadanDate();
  }, [coords, getRamadanDate]);

  return { ramadanDate, hijriYear };
}

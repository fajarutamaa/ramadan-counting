import { useState, useEffect, useCallback } from "react";

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
      if (cachedDate.getTime() > Date.now()) {
        setRamadanDate(cachedDate);
        setHijriYear(cachedYear);
        return;
      }
      sessionStorage.removeItem("ramadanDate");
      sessionStorage.removeItem("hijriYear");
    }

    try {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const yyyy = now.getFullYear();

      const todayRes = await fetch(`${baseUrl}/gToH/${dd}-${mm}-${yyyy}`);
      const todayData = await todayRes.json();

      if (todayData.code !== 200 || !todayData.data?.hijri) {
        throw new Error("Failed to get current Hijri date");
      }

      const currentHijriYear = parseInt(todayData.data.hijri.year);
      const currentHijriMonth = todayData.data.hijri.month.number;

      const targetHijriYear =
        currentHijriMonth <= 9 ? currentHijriYear : currentHijriYear + 1;

      const ramadanRes = await fetch(`${baseUrl}/hToG/9/1/${targetHijriYear}`);
      const ramadanData = await ramadanRes.json();

      if (ramadanData.code !== 200 || !ramadanData.data?.gregorian) {
        throw new Error("Failed to get Ramadan date");
      }

      const [rDay, rMon, rYear] = ramadanData.data.gregorian.date.split("-");
      let found = new Date(`${rYear}-${rMon}-${rDay}T00:00:00+07:00`);
      let year = targetHijriYear;

      if (found.getTime() <= Date.now()) {
        const nextRes = await fetch(
          `${baseUrl}/hToG/9/1/${targetHijriYear + 1}`,
        );
        const nextData = await nextRes.json();

        if (nextData.code !== 200 || !nextData.data?.gregorian) {
          throw new Error("Failed to get next Ramadan date");
        }

        const [nDay, nMon, nYear] = nextData.data.gregorian.date.split("-");
        found = new Date(`${nYear}-${nMon}-${nDay}T00:00:00+07:00`);
        year = targetHijriYear + 1;
      }

      setRamadanDate(found);
      setHijriYear(String(year));
      sessionStorage.setItem("ramadanDate", found.toISOString());
      sessionStorage.setItem("hijriYear", String(year));
    } catch (e) {
      console.error("Failed fetch Ramadan:", e);
      const fallback = new Date("2027-02-08T00:00:00+07:00");
      setRamadanDate(fallback);
    }
  }, [coords, baseUrl]);

  useEffect(() => {
    getRamadanDate();
  }, [coords, getRamadanDate]);

  return { ramadanDate, hijriYear };
}

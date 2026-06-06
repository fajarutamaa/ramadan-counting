import { useState, useEffect } from "react";
import { ISLAMIC_EVENTS } from "@/lib/islamicEvents";

export interface HijriDateInfo {
  day: number;
  month: number;
  monthAr: string;
  monthEn: string;
  year: number;
}

export interface IslamicEvent {
  id: string;
  name: string;
  date: Date;
  type: "event" | "holiday";
  emoji: string;
}

interface UseIslamicEventsResult {
  currentHijri: HijriDateInfo | null;
  events: IslamicEvent[];
  loading: boolean;
  error: string | null;
}

const EVENTS_CACHE_PREFIX = "islamicEvents_";
const HIJRI_CACHE_KEY = "hijriCurrent";

export function useIslamicEvents(baseUrl: string): UseIslamicEventsResult {
  const [currentHijri, setCurrentHijri] = useState<HijriDateInfo | null>(null);
  const [events, setEvents] = useState<IslamicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const now = new Date();
        const todayStr = now.toDateString();

        const cachedPack = sessionStorage.getItem(HIJRI_CACHE_KEY);
        if (cachedPack) {
          const parsed = JSON.parse(cachedPack);
          if (parsed.dateStr === todayStr) {
            const hijri = parsed.hijri as HijriDateInfo;
            const eventsCacheKey = EVENTS_CACHE_PREFIX + hijri.year;
            const cachedEvents = sessionStorage.getItem(eventsCacheKey);
            if (cachedEvents) {
              const restored: IslamicEvent[] = JSON.parse(cachedEvents).map(
                (e: IslamicEvent) => ({ ...e, date: new Date(e.date) }),
              );
              if (!cancelled) {
                setCurrentHijri(hijri);
                setEvents(restored);
                setError(null);
                setLoading(false);
              }
              return;
            }
          }
        }

        const dd = String(now.getDate()).padStart(2, "0");
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const yyyy = now.getFullYear();

        const todayRes = await fetch(`${baseUrl}/gToH/${dd}-${mm}-${yyyy}`);
        const todayData = await todayRes.json();

        if (todayData.code !== 200 || !todayData.data?.hijri) {
          throw new Error("Failed to get current Hijri date");
        }

        const hijri = todayData.data.hijri;
        const hijriInfo: HijriDateInfo = {
          day: parseInt(hijri.day),
          month: hijri.month.number,
          monthAr: hijri.month.ar,
          monthEn: hijri.month.en,
          year: parseInt(hijri.year),
        };

        sessionStorage.setItem(
          HIJRI_CACHE_KEY,
          JSON.stringify({ dateStr: todayStr, hijri: hijriInfo }),
        );

        if (cancelled) return;
        setCurrentHijri(hijriInfo);

        const { year: hijriYear, month: hijriMonth, day: hijriDay } = hijriInfo;

        const allPromises = ISLAMIC_EVENTS.map(async (entry) => {
          let targetYear = hijriYear;
          if (
            entry.hijriMonth < hijriMonth ||
            (entry.hijriMonth === hijriMonth && entry.hijriDay < hijriDay)
          ) {
            targetYear = hijriYear + 1;
          }

          const res = await fetch(
            `${baseUrl}/hToG/${entry.hijriMonth}/${entry.hijriDay}/${targetYear}`,
          );
          const data = await res.json();

          if (data.code !== 200 || !data.data?.gregorian) {
            throw new Error(`Failed to get date for ${entry.name}`);
          }

          const [rDay, rMon, rYear] = data.data.gregorian.date.split("-");
          const date = new Date(
            parseInt(rYear),
            parseInt(rMon) - 1,
            parseInt(rDay),
          );

          return {
            id: entry.id,
            name: entry.name,
            date,
            type: entry.type,
            emoji: entry.emoji,
          } as IslamicEvent;
        });

        const resolved = await Promise.all(allPromises);
        resolved.sort((a, b) => a.date.getTime() - b.date.getTime());

        sessionStorage.setItem(
          EVENTS_CACHE_PREFIX + hijriYear,
          JSON.stringify(resolved),
        );

        if (!cancelled) {
          setEvents(resolved);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("[useIslamicEvents] Failed:", e);
          setError("Could not load Islamic events.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [baseUrl]);

  return { currentHijri, events, loading, error };
}

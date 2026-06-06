import { useEffect, useState, useRef } from "react";
import type { Coords } from "./useGeolocation";

export interface PrayerTime {
  name: string;
  time: string;
  isCurrent: boolean;
  isNext: boolean;
}

interface PrayerTimesData {
  times: PrayerTime[];
  loading: boolean;
  error: string | null;
}

export function usePrayerTimes(coords: Coords | null): PrayerTimesData {
  const [prayerData, setPrayerData] = useState<PrayerTimesData>({
    times: [],
    loading: true,
    error: null,
  });

  const fetchedRef = useRef(false);
  const currentDateRef = useRef<string>("");

  useEffect(() => {
    if (!coords) return;

    const today = new Date().toDateString();

    // Check if we already fetched for today
    if (fetchedRef.current && currentDateRef.current === today) {
      return;
    }

    const fetchPrayerTimes = async () => {
      try {
        const response = await fetch(
          `https://api.aladhan.com/v1/timings?latitude=${coords.lat}&longitude=${coords.lon}&method=2`,
        );
        const data = await response.json();

        if (data.code === 200 && data.data?.timings) {
          const timings = data.data.timings;
          const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();

          const times: PrayerTime[] = prayerNames.map((name) => {
            const time = timings[name];

            return {
              name,
              time,
              isCurrent: false,
              isNext: false,
            };
          });

          // Find current and next prayer
          let nextPrayerIndex = -1;
          for (let i = 0; i < times.length; i++) {
            const [hours, minutes] = times[i].time.split(":").map(Number);
            const prayerMinutes = hours * 60 + minutes;

            if (prayerMinutes > currentMinutes) {
              nextPrayerIndex = i;
              break;
            }
          }

          if (nextPrayerIndex > 0) {
            times[nextPrayerIndex - 1].isCurrent = true;
            times[nextPrayerIndex].isNext = true;
          } else if (nextPrayerIndex === 0) {
            times[times.length - 1].isCurrent = true;
            times[0].isNext = true;
          } else {
            times[times.length - 1].isCurrent = true;
            times[0].isNext = true;
          }

          setPrayerData({
            times,
            loading: false,
            error: null,
          });

          fetchedRef.current = true;
          currentDateRef.current = today;
        } else {
          throw new Error("Invalid response from prayer times API");
        }
      } catch (err) {
        console.error("[usePrayerTimes] Failed to fetch:", err);
        setPrayerData({
          times: [],
          loading: false,
          error: "Failed to fetch prayer times",
        });
      }
    };

    fetchPrayerTimes();
  }, [coords]);

  return prayerData;
}

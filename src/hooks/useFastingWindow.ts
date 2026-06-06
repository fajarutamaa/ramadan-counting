import { useEffect, useState, useCallback } from "react";
import type { Coords } from "./useGeolocation";

export interface FastingWindowData {
  fajrTime: string;
  maghribTime: string;
  isFastingHour: boolean;
  iftarCountdown: { hours: number; minutes: number; seconds: number } | null;
  suhoorEndCountdown: {
    hours: number;
    minutes: number;
    seconds: number;
  } | null;
  fastingHoursToday: number;
  fastingProgress: number;
  nextEventLabel: string;
  loading: boolean;
  error: string | null;
}

function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function useFastingWindow(coords: Coords | null): FastingWindowData {
  const [data, setData] = useState<FastingWindowData>({
    fajrTime: "--:--",
    maghribTime: "--:--",
    isFastingHour: false,
    iftarCountdown: null,
    suhoorEndCountdown: null,
    fastingHoursToday: 0,
    fastingProgress: 0,
    nextEventLabel: "",
    loading: true,
    error: null,
  });

  const fetchTimes = useCallback(async () => {
    if (!coords) return;

    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${coords.lat}&longitude=${coords.lon}&method=2`,
      );
      const res = await response.json();

      if (res.code !== 200 || !res.data?.timings) {
        throw new Error("Failed to fetch prayer times");
      }

      const timings = res.data.timings;
      const fajrTime = timings.Fajr;
      const maghribTime = timings.Maghrib;
      const fajrMinutes = parseTime(fajrTime);
      const maghribMinutes = parseTime(maghribTime);
      const fastingDuration = maghribMinutes - fajrMinutes;

      setData((prev) => ({
        ...prev,
        fajrTime,
        maghribTime,
        fastingHoursToday: Math.round((fastingDuration / 60) * 10) / 10,
        loading: false,
        error: null,
      }));
    } catch {
      setData((prev) => ({ ...prev, loading: false, error: "Failed to load" }));
    }
  }, [coords]);

  useEffect(() => {
    fetchTimes();
  }, [fetchTimes]);

  // Live countdown tick — runs every second
  useEffect(() => {
    if (data.loading || data.error) return;

    const tick = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const fajrMinutes = parseTime(data.fajrTime);
      const maghribMinutes = parseTime(data.maghribTime);

      // Handle overnight fasting (Fajr to Maghrib same day)
      const fastingEnd = maghribMinutes;
      const fastingStart = fajrMinutes;

      const isFastingHour =
        currentMinutes >= fastingStart && currentMinutes < fastingEnd;

      let iftarCountdown: FastingWindowData["iftarCountdown"] = null;
      let suhoorEndCountdown: FastingWindowData["suhoorEndCountdown"] = null;
      let nextEventLabel = "";
      let fastingProgress = 0;

      if (isFastingHour) {
        // Countdown to Maghrib (Iftar)
        const remaining = (fastingEnd - currentMinutes) * 60;
        iftarCountdown = {
          hours: Math.floor(remaining / 3600),
          minutes: Math.floor((remaining % 3600) / 60),
          seconds: remaining % 60,
        };
        nextEventLabel = "Iftar";
        const elapsed = currentMinutes - fastingStart;
        fastingProgress = Math.min(
          100,
          (elapsed / (fastingEnd - fastingStart)) * 100,
        );
      } else if (currentMinutes < fastingStart) {
        // Before Fajr — countdown to Fajr (Suhoor end)
        const remaining = (fastingStart - currentMinutes) * 60;
        suhoorEndCountdown = {
          hours: Math.floor(remaining / 3600),
          minutes: Math.floor((remaining % 3600) / 60),
          seconds: remaining % 60,
        };
        nextEventLabel = "Suhoor ends";
        fastingProgress = 0;
      } else {
        // After Maghrib — countdown to next day's Fajr
        const remaining = (1440 - currentMinutes + fastingStart) * 60;
        suhoorEndCountdown = {
          hours: Math.floor(remaining / 3600),
          minutes: Math.floor((remaining % 3600) / 60),
          seconds: remaining % 60,
        };
        nextEventLabel = "Suhoor ends";
        fastingProgress = 100;
      }

      setData((prev) => ({
        ...prev,
        isFastingHour,
        iftarCountdown,
        suhoorEndCountdown,
        nextEventLabel,
        fastingProgress: Math.round(fastingProgress * 10) / 10,
      }));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [data.loading, data.error, data.fajrTime, data.maghribTime]);

  return data;
}

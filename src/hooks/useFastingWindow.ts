import { useEffect, useMemo, useState } from "react";
import type { PrayerTimesData } from "@/hooks/usePrayerTimes";
import { shiftPrayerDate } from "@/lib/prayerSchedule";
import { createPrayerClock, prayerMoment } from "@/lib/prayerClock";

interface Boundary {
  date: string;
  time: string;
  moment: number | null;
}

type Day = PrayerTimesData["today"];

function findBoundary(
  day: Day,
  name: "Fajr" | "Maghrib",
  clock: Intl.DateTimeFormat,
): Boundary | null {
  const prayer = day.times.find((entry) => entry.name === name);
  if (!prayer) return null;
  const date = shiftPrayerDate(day.date, prayer.dayOffset);
  return {
    date,
    time: prayer.time,
    moment: prayerMoment(date, prayer.time, clock),
  };
}

export function useFastingWindow(
  prayers: PrayerTimesData,
  tomorrowIsRamadan: boolean | null,
) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  const clock = useMemo(
    () => createPrayerClock(prayers.timeZone),
    [prayers.timeZone],
  );
  const suhoor = useMemo(
    () => findBoundary(prayers.today, "Fajr", clock),
    [prayers.today, clock],
  );
  const iftar = useMemo(
    () => findBoundary(prayers.today, "Maghrib", clock),
    [prayers.today, clock],
  );
  const tomorrowSuhoor = useMemo(
    () => findBoundary(prayers.tomorrow, "Fajr", clock),
    [prayers.tomorrow, clock],
  );
  const start = suhoor?.moment;
  const end = iftar?.moment;
  const valid = start != null && end != null && end > start;
  const afterIftar = valid && now >= end;

  const target =
    !valid || !suhoor || !iftar
      ? null
      : now < start
        ? {
            boundary: suhoor,
            label: "Sahur ends",
            fromCache: prayers.today.fromCache,
          }
        : !afterIftar
          ? {
              boundary: iftar,
              label: "Iftar begins",
              fromCache: prayers.today.fromCache,
            }
          : tomorrowIsRamadan &&
              tomorrowSuhoor?.moment != null &&
              tomorrowSuhoor.moment > now
            ? {
                boundary: tomorrowSuhoor,
                label: "Next sahur ends",
                fromCache: prayers.tomorrow.fromCache,
              }
            : null;

  return {
    suhoor,
    iftar,
    valid,
    afterIftar,
    complete: afterIftar && tomorrowIsRamadan === false,
    next:
      target?.boundary.moment != null
        ? {
            ...target,
            seconds: Math.ceil((target.boundary.moment - now) / 1000),
          }
        : null,
  };
}

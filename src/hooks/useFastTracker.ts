import { useLocalStorage } from "@/hooks/useLocalStorage";
import { shiftPrayerDate } from "@/lib/prayerSchedule";

export type FastStatus = "fasted" | "not-fasted" | "excused";
type FastRecord = Record<string, FastStatus>;

function isFastStatus(value: unknown): value is FastStatus {
  return value === "fasted" || value === "not-fasted" || value === "excused";
}

export function useFastTracker(today: string, ramadanDay: number) {
  const [stored, setRecords] = useLocalStorage<FastRecord>("fastTracker", {});
  const records = stored ?? {};
  const todayStatus = isFastStatus(records[today]) ? records[today] : null;
  const entries: { date: string; day: number; status: FastStatus }[] = [];
  let totalFasted = 0;
  let bestStreak = 0;
  let run = 0;

  for (let day = 1; day <= ramadanDay; day++) {
    const date = shiftPrayerDate(today, day - ramadanDay);
    const status = records[date];
    if (isFastStatus(status)) entries.push({ date, day, status });
    if (status === "fasted") {
      totalFasted++;
      run++;
      bestStreak = Math.max(bestStreak, run);
    } else if (day !== ramadanDay || todayStatus !== null) {
      run = 0;
    }
  }

  function setTodayStatus(status: FastStatus | null) {
    const next = { ...records };
    if (status) next[today] = status;
    else delete next[today];
    setRecords(next);
  }

  return {
    todayStatus,
    setTodayStatus,
    totalFasted,
    currentStreak: run,
    bestStreak,
    entries: entries.reverse(),
  };
}
